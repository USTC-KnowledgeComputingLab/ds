"""E-graph implementation for equality saturation.

This module provides an implementation of E-graphs (Equivalence Graphs),
which efficiently represent equivalence classes of expressions.
"""

__all__ = ["EClassId", "UnionFind", "ENode", "EGraph"]

from collections import defaultdict


class EClassId(int):
    """Strongly-typed equivalence class identifier."""

    pass


class UnionFind:
    """Union-find data structure for tracking equivalence classes."""

    def __init__(self):
        """Initialize an empty union-find structure."""
        self.parent = {}

    def find(self, x):
        """Find the representative of the equivalence class containing x.

        Args:
            x: An EClassId to look up.

        Returns:
            The canonical representative EClassId for x's equivalence class.
        """
        if x not in self.parent:
            self.parent[x] = x
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        """Merge the equivalence classes containing a and b.

        Args:
            a: First EClassId.
            b: Second EClassId.

        Returns:
            The canonical representative of the merged class.
        """
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra
        return ra


class ENode:
    """A node in the E-graph representing an operation applied to children.

    Attributes:
        op: Operation name (string for items/variables, "()" for lists).
        children: Tuple of EClassId references to child e-classes.
    """

    def __init__(self, op, children):
        """Create a new E-node.

        Args:
            op: Operation string (for items/variables use the string itself,
                for lists use "()").
            children: Tuple of EClassId values representing children.
        """
        self.op = op
        self.children = tuple(children)

    def canonicalize(self, find):
        """Return a canonical version of this node using the find function.

        Args:
            find: Function that maps EClassId to canonical representative.

        Returns:
            A new ENode with canonicalized children.
        """
        return ENode(self.op, tuple(find(c) for c in self.children))

    def __eq__(self, other):
        """Check equality with another ENode."""
        if not isinstance(other, ENode):
            return False
        return self.op == other.op and self.children == other.children

    def __hash__(self):
        """Compute hash for use in dictionaries."""
        return hash((self.op, self.children))

    def __repr__(self):
        """Return string representation."""
        if not self.children:
            return self.op
        return f"({self.op} {' '.join(str(c) for c in self.children)})"


class EGraph:
    """E-graph data structure for equality saturation.

    An E-graph maintains equivalence classes of expressions and supports
    efficient congruence closure through deferred rebuilding.
    """

    def __init__(self):
        """Initialize an empty E-graph."""
        self.uf = UnionFind()
        self.next_id = 0
        self.classes = {}
        self.parents = defaultdict(set)
        self.hashcons = {}
        self.worklist = set()

    def _fresh_id(self):
        """Generate a fresh equivalence class ID.

        Returns:
            A new unique EClassId.
        """
        eid = EClassId(self.next_id)
        self.next_id += 1
        return eid

    def find(self, eclass):
        """Find the canonical representative of an equivalence class.

        Args:
            eclass: An EClassId to look up.

        Returns:
            The canonical EClassId representative.
        """
        return self.uf.find(eclass)

    def add(self, enode):
        """Add an E-node to the graph.

        If an equivalent node already exists, returns its class ID.
        Otherwise creates a new equivalence class.

        Args:
            enode: The ENode to add.

        Returns:
            The EClassId of the equivalence class containing this node.
        """
        enode = enode.canonicalize(self.find)

        if enode in self.hashcons:
            return self.find(self.hashcons[enode])

        eid = self._fresh_id()

        self.uf.parent[eid] = eid
        self.classes[eid] = {enode}
        self.hashcons[enode] = eid

        for c in enode.children:
            self.parents[c].add((enode, eid))

        return eid

    def merge(self, a, b):
        """Merge two equivalence classes.

        Args:
            a: First EClassId to merge.
            b: Second EClassId to merge.

        Returns:
            The canonical EClassId of the merged class.
        """
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return ra

        r = self.uf.union(ra, rb)

        self.classes[r] |= self.classes[rb]
        del self.classes[rb]

        self.parents[r] |= self.parents[rb]
        del self.parents[rb]

        self.worklist.add(r)

        return r

    def rebuild(self):
        """Restore congruence closure after merges.

        This method processes the worklist to ensure that congruent
        nodes are in the same equivalence class.
        """
        while self.worklist:
            todo = {self.find(e) for e in self.worklist}
            self.worklist.clear()

            for eclass in todo:
                self.repair(eclass)

    def repair(self, eclass):
        """Repair a single equivalence class to maintain congruence.

        Args:
            eclass: The EClassId to repair.
        """
        new_parents = {}

        for pnode, peclass in list(self.parents[eclass]):
            self.hashcons.pop(pnode, None)

            canon = pnode.canonicalize(self.find)
            peclass = self.find(peclass)

            if canon in new_parents:
                self.merge(peclass, new_parents[canon])
            else:
                new_parents[canon] = peclass
                self.hashcons[canon] = peclass

        self.parents[eclass] = {(p, c) for p, c in new_parents.items()}

    def dump(self):
        """Print the contents of the E-graph for debugging."""
        print("E-Graph:")
        for eid, nodes in self.classes.items():
            print(f"  class {eid}:")
            for n in nodes:
                print(f"    {n}")
        print()
