"""Wrapper class for logical terms in the deductive system."""

from __future__ import annotations

__all__ = [
    "Term",
]

from . import ds
from .common import Common
from .variable_t import Variable
from .item_t import Item
from .list_t import List
from .buffer_size import buffer_size


class Term(Common[ds.Term]):
    """Wrapper class for logical terms in the deductive system.

    A term can be a variable, item, or list.

    Example:
        >>> term = Term("(f `x a)")
        >>> inner_term = term.term  # Get the underlying term type
    """

    _base = ds.Term

    @property
    def term(self) -> Variable | Item | List:
        """Extracts the underlying term and returns it as its concrete type.

        Returns:
            The term as a Variable, Item, or List.

        Raises:
            TypeError: If the term type is unexpected.
        """
        match self.value.get_type():
            case ds.Term.Type.Variable:
                return Variable(self.value.variable())
            case ds.Term.Type.Item:
                return Item(self.value.item())
            case ds.Term.Type.List:
                return List(self.value.list())
            case _:
                raise TypeError("Unexpected term type.")

    def __floordiv__(self, other: Term) -> Term | None:
        return self.ground(other)

    def ground(self, other: Term, scope: str | None = None) -> Term | None:
        """Ground this term using a dictionary to substitute variables with values.

        Args:
            other: A term representing a dictionary (list of pairs). Each pair contains
                   a variable and its substitution value.
                   Example: Term("((`a b))") means substitute variable `a with value b.
            scope: Optional scope string for variable scoping.

        Returns:
            The grounded term, or None if grounding fails.

        Example:
            >>> a = Term("`a")
            >>> b = Term("((`a b))")
            >>> str(a.ground(b))  # "b"
            >>>
            >>> # With scope
            >>> c = Term("`a")
            >>> d = Term("((x y `a `b) (y x `b `c))")
            >>> str(c.ground(d, "x"))  # "`c"
        """
        capacity = buffer_size()
        term = ds.Term.ground(self.value, other.value, scope, capacity)
        if term is None:
            return None
        return Term(term, capacity)
