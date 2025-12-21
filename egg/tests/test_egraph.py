"""Tests for apyds_egg E-graph implementation."""

from apyds_egg import EClassId, UnionFind, ENode, EGraph


def test_eclassid_is_int():
    """Test that EClassId behaves as an integer."""
    eid = EClassId(42)
    assert eid == 42
    assert isinstance(eid, int)


def test_unionfind_init():
    """Test UnionFind initialization."""
    uf = UnionFind()
    assert uf.parent == {}


def test_unionfind_find_single():
    """Test finding a single element."""
    uf = UnionFind()
    x = EClassId(0)
    assert uf.find(x) == x


def test_unionfind_find_path_compression():
    """Test that find performs path compression."""
    uf = UnionFind()
    a = EClassId(0)
    b = EClassId(1)
    c = EClassId(2)

    uf.parent[a] = a
    uf.parent[b] = a
    uf.parent[c] = b

    assert uf.find(c) == a
    assert uf.parent[c] == a


def test_unionfind_union():
    """Test union of two elements."""
    uf = UnionFind()
    a = EClassId(0)
    b = EClassId(1)

    uf.parent[a] = a
    uf.parent[b] = b

    r = uf.union(a, b)
    assert r == a
    assert uf.find(a) == uf.find(b)


def test_unionfind_union_same_class():
    """Test union of elements already in same class."""
    uf = UnionFind()
    a = EClassId(0)

    uf.parent[a] = a

    r = uf.union(a, a)
    assert r == a


def test_enode_init():
    """Test ENode initialization."""
    node = ENode("x", ())
    assert node.op == "x"
    assert node.children == ()


def test_enode_with_children():
    """Test ENode with children."""
    a = EClassId(0)
    b = EClassId(1)
    node = ENode("+", (a, b))
    assert node.op == "+"
    assert node.children == (a, b)


def test_enode_list_op():
    """Test ENode using list operation."""
    a = EClassId(0)
    b = EClassId(1)
    c = EClassId(2)
    node = ENode("()", (a, b, c))
    assert node.op == "()"
    assert node.children == (a, b, c)


def test_enode_canonicalize():
    """Test ENode canonicalization."""
    a = EClassId(0)
    b = EClassId(1)
    node = ENode("+", (a, b))

    def find(x):
        if x == a:
            return EClassId(2)
        return x

    canon = node.canonicalize(find)
    assert canon.op == "+"
    assert canon.children == (EClassId(2), b)


def test_enode_equality():
    """Test ENode equality comparison."""
    a = EClassId(0)
    b = EClassId(1)

    node1 = ENode("+", (a, b))
    node2 = ENode("+", (a, b))
    node3 = ENode("-", (a, b))

    assert node1 == node2
    assert node1 != node3
    assert node1 != "not a node"


def test_enode_hash():
    """Test ENode hashing."""
    a = EClassId(0)
    b = EClassId(1)

    node1 = ENode("+", (a, b))
    node2 = ENode("+", (a, b))

    assert hash(node1) == hash(node2)


def test_enode_repr():
    """Test ENode string representation."""
    node1 = ENode("x", ())
    assert repr(node1) == "x"

    a = EClassId(0)
    b = EClassId(1)
    node2 = ENode("+", (a, b))
    assert repr(node2) == "(+ 0 1)"


def test_egraph_init():
    """Test EGraph initialization."""
    eg = EGraph()
    assert eg.next_id == 0
    assert eg.classes == {}
    assert eg.hashcons == {}
    assert eg.worklist == set()


def test_egraph_add_constant():
    """Test adding a constant to the E-graph."""
    eg = EGraph()
    x = eg.add(ENode("x", ()))

    assert isinstance(x, EClassId)
    assert x == EClassId(0)
    assert eg.next_id == 1


def test_egraph_add_duplicate():
    """Test adding duplicate nodes returns same class."""
    eg = EGraph()
    x1 = eg.add(ENode("x", ()))
    x2 = eg.add(ENode("x", ()))

    assert x1 == x2


def test_egraph_add_with_children():
    """Test adding nodes with children."""
    eg = EGraph()
    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))
    ab = eg.add(ENode("+", (a, b)))

    assert ab != a
    assert ab != b


def test_egraph_find():
    """Test finding equivalence class representative."""
    eg = EGraph()
    x = eg.add(ENode("x", ()))

    assert eg.find(x) == x


def test_egraph_merge():
    """Test merging two equivalence classes."""
    eg = EGraph()
    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))

    r = eg.merge(a, b)
    assert eg.find(a) == eg.find(b)


def test_egraph_merge_same_class():
    """Test merging a class with itself."""
    eg = EGraph()
    x = eg.add(ENode("x", ()))

    r = eg.merge(x, x)
    assert r == eg.find(x)


def test_egraph_congruence():
    """Test congruence closure after merge and rebuild."""
    eg = EGraph()

    x = eg.add(ENode("x", ()))
    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))

    ax = eg.add(ENode("+", (a, x)))
    bx = eg.add(ENode("+", (b, x)))

    assert eg.find(ax) != eg.find(bx)

    eg.merge(a, b)
    eg.rebuild()

    assert eg.find(ax) == eg.find(bx)


def test_egraph_complex_congruence():
    """Test congruence with more complex expressions."""
    eg = EGraph()

    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))
    c = eg.add(ENode("c", ()))

    ac = eg.add(ENode("+", (a, c)))
    bc = eg.add(ENode("+", (b, c)))

    aac = eg.add(ENode("*", (a, ac)))
    bbc = eg.add(ENode("*", (b, bc)))

    eg.merge(a, b)
    eg.rebuild()

    assert eg.find(ac) == eg.find(bc)
    assert eg.find(aac) == eg.find(bbc)


def test_egraph_list_operation():
    """Test E-graph with list operations using () op."""
    eg = EGraph()

    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))
    c = eg.add(ENode("c", ()))

    list1 = eg.add(ENode("()", (a, b, c)))
    list2 = eg.add(ENode("()", (a, b, c)))

    assert eg.find(list1) == eg.find(list2)


def test_egraph_list_congruence():
    """Test congruence with list operations."""
    eg = EGraph()

    x = eg.add(ENode("x", ()))
    y = eg.add(ENode("y", ()))
    a = eg.add(ENode("a", ()))

    list1 = eg.add(ENode("()", (x, a)))
    list2 = eg.add(ENode("()", (y, a)))

    assert eg.find(list1) != eg.find(list2)

    eg.merge(x, y)
    eg.rebuild()

    assert eg.find(list1) == eg.find(list2)


def test_egraph_multiple_rebuilds():
    """Test multiple rebuilds maintain correctness."""
    eg = EGraph()

    a = eg.add(ENode("a", ()))
    b = eg.add(ENode("b", ()))
    c = eg.add(ENode("c", ()))

    ab = eg.add(ENode("+", (a, b)))
    bc = eg.add(ENode("+", (b, c)))

    eg.merge(a, b)
    eg.rebuild()

    assert eg.find(a) == eg.find(b)

    eg.merge(b, c)
    eg.rebuild()

    assert eg.find(a) == eg.find(b)
    assert eg.find(b) == eg.find(c)
    assert eg.find(a) == eg.find(c)


def test_egraph_dump(capsys):
    """Test dump method prints E-graph contents."""
    eg = EGraph()
    x = eg.add(ENode("x", ()))

    eg.dump()
    captured = capsys.readouterr()

    assert "E-Graph:" in captured.out
    assert "class" in captured.out


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
