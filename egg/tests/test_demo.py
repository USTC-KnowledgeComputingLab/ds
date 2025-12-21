"""Demonstration tests showing typical E-graph usage."""

from apyds_egg import EGraph, ENode


def test_demo_basic():
    """Demonstrate basic E-graph usage with constants and operations."""
    eg = EGraph()

    x = eg.add(ENode("x", ()))
    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))

    ax = eg.add(ENode("+", (a, x)))
    bx = eg.add(ENode("+", (b, x)))

    before_ax = eg.find(ax)
    before_bx = eg.find(bx)
    assert before_ax != before_bx

    eg.merge(a, b)
    eg.rebuild()

    after_ax = eg.find(ax)
    after_bx = eg.find(bx)
    assert after_ax == after_bx


def test_demo_variables():
    """Demonstrate using variable strings as operations."""
    eg = EGraph()

    var_x = eg.add(ENode("x", ()))
    var_y = eg.add(ENode("y", ()))

    assert eg.find(var_x) != eg.find(var_y)

    eg.merge(var_x, var_y)
    eg.rebuild()

    assert eg.find(var_x) == eg.find(var_y)


def test_demo_items():
    """Demonstrate using item strings as operations."""
    eg = EGraph()

    item_a = eg.add(ENode("atom", ()))
    item_b = eg.add(ENode("symbol", ()))

    expr1 = eg.add(ENode("func", (item_a,)))
    expr2 = eg.add(ENode("func", (item_b,)))

    assert eg.find(expr1) != eg.find(expr2)

    eg.merge(item_a, item_b)
    eg.rebuild()

    assert eg.find(expr1) == eg.find(expr2)


def test_demo_lists():
    """Demonstrate using () for list operations."""
    eg = EGraph()

    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))
    c = eg.add(ENode("c", ()))

    list1 = eg.add(ENode("()", (a, b, c)))
    list2 = eg.add(ENode("()", (a, b, c)))

    assert eg.find(list1) == eg.find(list2)


def test_demo_nested_lists():
    """Demonstrate nested list structures."""
    eg = EGraph()

    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))

    inner_list = eg.add(ENode("()", (a, b)))
    outer_list = eg.add(ENode("()", (inner_list, a)))

    assert eg.find(outer_list) != eg.find(inner_list)


def test_demo_mixed_operations():
    """Demonstrate mixed item, variable, and list operations."""
    eg = EGraph()

    var_x = eg.add(ENode("x", ()))
    item_f = eg.add(ENode("f", ()))

    arg_list = eg.add(ENode("()", (var_x,)))

    func_call1 = eg.add(ENode("apply", (item_f, arg_list)))

    var_y = eg.add(ENode("y", ()))
    arg_list2 = eg.add(ENode("()", (var_y,)))
    func_call2 = eg.add(ENode("apply", (item_f, arg_list2)))

    assert eg.find(func_call1) != eg.find(func_call2)

    eg.merge(var_x, var_y)
    eg.rebuild()

    assert eg.find(arg_list) == eg.find(arg_list2)
    assert eg.find(func_call1) == eg.find(func_call2)
