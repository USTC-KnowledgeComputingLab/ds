# cython: language_level=3
# cython: boundscheck=False
# cython: wraparound=False
# cython: cdivision=True

from __future__ import annotations

__all__ = ["EClassId", "UnionFind", "ENode", "EGraph"]

from typing import NewType, Callable, TypeVar, Generic
from collections import defaultdict
import apyds

EClassId = NewType("EClassId", int)

T = TypeVar("T")


cdef class UnionFind:
    """Union-find data structure for managing disjoint sets."""
    
    cdef dict parent
    
    def __init__(self) -> None:
        self.parent = {}

    cpdef object find(self, object x):
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

    cpdef object union(self, object a, object b):
        """Union two sets and return the canonical representative.

        Args:
            a: The first element.
            b: The second element.

        Returns:
            The canonical representative of the merged set.
        """
        cdef object ra, rb
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra
        return ra


cdef class ENode:
    """Node in the E-Graph with an operator and children."""
    
    cdef readonly str op
    cdef readonly tuple children
    cdef int _hash
    cdef bint _hash_computed
    
    def __init__(self, str op, tuple children):
        self.op = op
        self.children = children
        self._hash_computed = False
    
    def __hash__(self):
        if not self._hash_computed:
            self._hash = hash((self.op, self.children))
            self._hash_computed = True
        return self._hash
    
    def __eq__(self, other):
        if not isinstance(other, ENode):
            return False
        return self.op == other.op and self.children == other.children
    
    def __repr__(self):
        return f"ENode({self.op!r}, {self.children!r})"

    def canonicalize(self, object find_func):
        """Canonicalize children using the find function.

        Args:
            find_func: Function to find the canonical E-class ID.

        Returns:
            A new ENode with canonicalized children.
        """
        cdef tuple canon_children = tuple(find_func(c) for c in self.children)
        return ENode(self.op, canon_children)


cdef class EGraph:
    """E-Graph for representing equivalence classes of terms."""
    
    cdef int _next_id
    cdef dict _hashcons
    cdef UnionFind _unionfind
    cdef dict _classes
    cdef object _parents
    cdef set _worklist
    
    def __init__(self) -> None:
        # 1. Uniqueness constraint (hashcons):
        #    ENode -> EClassId mapping. Ensures nodes with the same operator and children 
        #    belonging to the same E-Class are unique in memory.
        # 2. Equivalence maintenance (unionfind):
        #    Manages union-find relationships between EClassIds. Maps multiple logical 
        #    E-Classes to a unique representative through the find operation.
        # 3. Set membership constraint (classes):
        #    EClassId (representative) -> Set[ENode] mapping. Stores all equivalent terms 
        #    in the current equivalence class.
        # 4. Reverse propagation constraint (parents):
        #    EClassId (representative) -> Set[(ENode, EClassId)] mapping. Records which 
        #    parent nodes depend on this E-Class. When two E-Classes merge, must notify 
        #    and update all parent nodes through this field to maintain congruence closure.
        self._next_id = 0
        self._hashcons = {}
        self._unionfind = UnionFind()
        self._classes = {}
        self._parents = defaultdict(set)
        self._worklist = set()
    
    # Expose internal state for compatibility
    @property
    def next_id(self):
        return self._next_id
    
    @property
    def hashcons(self):
        return self._hashcons
    
    @property
    def unionfind(self):
        return self._unionfind
    
    @property
    def classes(self):
        return self._classes
    
    @property
    def parents(self):
        return self._parents
    
    @property
    def worklist(self):
        return self._worklist

    cdef object _fresh_id(self):
        """Generate a fresh E-class ID."""
        cdef int eid_val = self._next_id
        self._next_id += 1
        return EClassId(eid_val)

    cpdef object find(self, object eclass):
        """Find the canonical representative of an E-class.

        Args:
            eclass: The E-class ID to find.

        Returns:
            The canonical E-class ID.
        """
        return self._unionfind.find(eclass)

    cpdef object add(self, object term):
        """Add a term to the E-Graph and return its E-class ID.

        Args:
            term: An apyds.Term to add to the E-Graph.

        Returns:
            The E-class ID for the added term.
        """
        cdef ENode enode = self._term_to_enode(term)
        return self._add_enode(enode)

    cdef ENode _term_to_enode(self, object term):
        """Convert an apyds.Term to an ENode."""
        cdef object inner = term.term
        cdef list children
        cdef object child_term, child_id
        cdef int i

        if isinstance(inner, apyds.List):
            children = []
            for i in range(len(inner)):
                child_term = inner[i]
                child_id = self.add(child_term)
                children.append(child_id)
            return ENode("()", tuple(children))
        else:
            return ENode(str(inner), ())

    cdef object _add_enode(self, ENode enode):
        """Add an ENode to the E-Graph."""
        cdef object eid, c
        enode = enode.canonicalize(self.find)

        if enode in self._hashcons:
            return self.find(self._hashcons[enode])

        eid = self._fresh_id()

        self._hashcons[enode] = eid
        self._unionfind.parent[eid] = eid
        self._classes[eid] = {enode}

        for c in enode.children:
            self._parents[c].add((enode, eid))

        return eid

    cpdef object merge(self, object a, object b):
        """Merge two E-classes and defer congruence restoration.

        Args:
            a: The first E-class ID to merge.
            b: The second E-class ID to merge.

        Returns:
            The canonical E-class ID of the merged class.
        """
        cdef object ra, rb, r
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return ra

        r = self._unionfind.union(ra, rb)

        self._classes[r] |= self._classes[rb]
        del self._classes[rb]

        self._parents[r] |= self._parents[rb]
        del self._parents[rb]

        self._worklist.add(r)

        return r

    cpdef void rebuild(self):
        """Restore congruence by processing the worklist.

        This method implements the egg-style deferred rebuilding:
        - Process all E-classes in the worklist
        - Re-canonicalize parents and merge congruent ones
        - Continue until worklist is empty
        """
        cdef set todo
        cdef object eclass
        
        while self._worklist:
            todo = {self.find(e) for e in self._worklist}
            self._worklist.clear()

            for eclass in todo:
                self._repair(eclass)

    cdef void _repair(self, object eclass):
        """Restore congruence for a single E-class.

        This method implements the egg-style repair algorithm:
        - Re-canonicalize all parent nodes
        - Merge congruent parents (which may add more work to worklist)
        - Update hashcons and parent tracking
        """
        cdef dict new_parents = {}
        cdef object pnode, peclass, canon

        for pnode, peclass in list(self._parents[eclass]):
            self._hashcons.pop(pnode, None)

            canon = pnode.canonicalize(self.find)
            peclass = self.find(peclass)

            if canon in new_parents:
                self.merge(peclass, new_parents[canon])
            else:
                new_parents[canon] = peclass
                self._hashcons[canon] = peclass

        self._parents[eclass] = {(p, c) for p, c in new_parents.items()}
