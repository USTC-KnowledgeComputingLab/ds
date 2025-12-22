from __future__ import annotations

__all__ = ["EClassId", "UnionFind", "ENode", "EGraph"]

from dataclasses import dataclass
from typing import NewType, Callable, TypeVar, Generic
from collections import defaultdict
import apyds

EClassId = NewType("EClassId", int)

T = TypeVar("T")


class UnionFind(Generic[T]):
    """Union-find data structure for managing disjoint sets."""

    def __init__(self) -> None:
        self.parent: dict[T, T] = {}

    def find(self, x: T) -> T:
        """Find the canonical representative of x's set with path compression.

        Args:
            x: The element to find.

        Returns:
            The canonical representative of x's set.
        """
        if x not in self.parent:
            self.parent[x] = x
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a: T, b: T) -> T:
        """Union two sets and return the canonical representative.

        Args:
            a: The first element.
            b: The second element.

        Returns:
            The canonical representative of the merged set.
        """
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra
        return ra


@dataclass(frozen=True)
class ENode:
    """Node in the E-Graph with an operator and children."""

    op: str
    children: tuple[EClassId, ...]

    def canonicalize(self, find: Callable[[EClassId], EClassId]) -> ENode:
        """Canonicalize children using the find function.

        Args:
            find: Function to find the canonical E-class ID.

        Returns:
            A new ENode with canonicalized children.
        """
        return ENode(self.op, tuple(find(c) for c in self.children))


class EGraph:
    """E-Graph for representing equivalence classes of terms."""

    def __init__(self) -> None:
        # 1. 唯一性约束 (hashcons):
        #    ENode -> EClassId 的映射。确保具有相同算子且子项属于相同 E-Class 的节点在内存中是唯一的。
        # 2. 等价性维护 (unionfind):
        #    管理 EClassId 之间的并查集关系。通过 find 操作将逻辑上的多个 E-Class 映射到唯一的代表元。
        # 3. 集合成员约束 (classes):
        #    EClassId (代表元) -> Set[ENode] 的映射。存储当前等价类中包含的所有等价项。
        # 4. 逆向传播约束 (parents):
        #    EClassId (代表元) -> Set[(ENode, EClassId)] 的映射。记录哪些父节点依赖于该 E-Class。
        #    当两个 E-Class 合并时，必须通过此字段通知并更新所有父节点，以维护全等闭包。
        self.next_id: int = 0
        self.hashcons: dict[ENode, EClassId] = {}
        self.unionfind: UnionFind[EClassId] = UnionFind()
        self.classes: dict[EClassId, set[ENode]] = {}
        self.parents: dict[EClassId, set[tuple[ENode, EClassId]]] = defaultdict(set)

    def _fresh_id(self) -> EClassId:
        """Generate a fresh E-class ID."""
        eid = EClassId(self.next_id)
        self.next_id += 1
        return eid

    def find(self, eclass: EClassId) -> EClassId:
        """Find the canonical representative of an E-class.

        Args:
            eclass: The E-class ID to find.

        Returns:
            The canonical E-class ID.
        """
        return self.unionfind.find(eclass)

    def add(self, term: apyds.Term) -> EClassId:
        """Add a term to the E-Graph and return its E-class ID.

        Args:
            term: An apyds.Term to add to the E-Graph.

        Returns:
            The E-class ID for the added term.
        """
        enode = self._term_to_enode(term)
        return self._add_enode(enode)

    def _term_to_enode(self, term: apyds.Term) -> ENode:
        """Convert an apyds.Term to an ENode."""
        inner = term.term

        if isinstance(inner, apyds.List):
            children: list[EClassId] = []
            for i in range(len(inner)):
                child_term = inner[i]
                child_id = self.add(child_term)
                children.append(child_id)
            return ENode("()", tuple(children))
        else:
            return ENode(str(inner), ())

    def _add_enode(self, enode: ENode) -> EClassId:
        """Add an ENode to the E-Graph."""
        enode = enode.canonicalize(self.find)

        if enode in self.hashcons:
            return self.find(self.hashcons[enode])

        eid = self._fresh_id()

        self.hashcons[enode] = eid
        self.unionfind.parent[eid] = eid
        self.classes[eid] = {enode}

        for c in enode.children:
            self.parents[c].add((enode, eid))

        return eid

    def merge(self, a: EClassId, b: EClassId) -> EClassId:
        """Merge two E-classes and immediately restore congruence.

        Args:
            a: The first E-class ID to merge.
            b: The second E-class ID to merge.

        Returns:
            The canonical E-class ID of the merged class.
        """
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return ra

        r = self.unionfind.union(ra, rb)

        self.classes[r] |= self.classes[rb]
        del self.classes[rb]

        self.parents[r] |= self.parents[rb]
        del self.parents[rb]

        self._repair(r)

        return r

    def _repair(self, eclass: EClassId) -> None:
        """Immediately restore congruence by re-canonicalizing parents and merging congruent ones.

        This method implements the traditional E-Graph repair algorithm:
        - Re-canonicalize all parent nodes
        - Merge congruent parents recursively
        - Continue until no more changes occur
        """
        changed = True
        while changed:
            changed = False
            new_parents: dict[ENode, EClassId] = {}

            for pnode, peclass in list(self.parents[eclass]):
                self.hashcons.pop(pnode, None)

                canon = pnode.canonicalize(self.find)
                peclass = self.find(peclass)

                if canon in new_parents:
                    self.merge(peclass, new_parents[canon])
                    changed = True
                else:
                    new_parents[canon] = peclass
                    self.hashcons[canon] = peclass

            self.parents[eclass] = {(p, c) for p, c in new_parents.items()}
