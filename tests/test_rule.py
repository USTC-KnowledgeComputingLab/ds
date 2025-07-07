import pytest
import copy
import pyds


@pytest.fixture
def r() -> pyds.Rule:
    return pyds.Rule("(a b c)")


def test_str(r: pyds.Rule) -> None:
    assert str(r) == "----\n(a b c)\n"

    with pyds.scoped_buffer_size(4):
        with pytest.raises(ValueError):
            str(r)


def test_repr(r: pyds.Rule) -> None:
    assert repr(r) == "Rule[\n----\n(a b c)\n]"


def test_copy_hash_and_equality(r: pyds.Rule) -> None:
    other = copy.copy(r)
    assert other == r
    assert hash(other) == hash(r)
    assert 1 != r


def test_create_from_same(r: pyds.Rule) -> None:
    rule = pyds.Rule(r)
    assert str(rule) == "----\n(a b c)\n"

    with pytest.raises(ValueError):
        rule = pyds.Rule(r, 100)


def test_create_from_base(r: pyds.Rule) -> None:
    rule = pyds.Rule(r.value)
    assert str(rule) == "----\n(a b c)\n"


def test_create_from_text() -> None:
    rule = pyds.Rule("(a b c)")
    assert str(rule) == "----\n(a b c)\n"

    # rule never fails


def test_create_from_bytes(r: pyds.Rule) -> None:
    rule = pyds.Rule(r.data())
    assert str(rule) == "----\n(a b c)\n"

    with pytest.raises(ValueError):
        rule = pyds.Rule(r.data(), 100)


def test_create_fail() -> None:
    with pytest.raises(TypeError):
        rule = pyds.Rule(100)


def test_len() -> None:
    r = pyds.Rule("(p -> q)\np\nq\n")
    assert len(r) == 2


def test_getitem() -> None:
    r = pyds.Rule("(p -> q)\np\nq\n")
    assert str(r[0]) == "(p -> q)"
    assert str(r[1]) == "p"

    with pytest.raises(TypeError):
        _ = r[-1]

    with pytest.raises(TypeError):
        _ = r[2]


def test_conclusion() -> None:
    r = pyds.Rule("(p -> q)\np\nq\n")
    assert str(r.conclusion) == "q"


def test_ground_simple() -> None:
    a = pyds.Rule("`a")
    b = pyds.Rule("((`a b))")
    assert str(a // b) == "----\nb\n"

    assert a // pyds.Rule("((`a b c d e))") is None


def test_ground_scope() -> None:
    a = pyds.Rule("`a")
    b = pyds.Rule("((x y `a `b) (y x `b `c))")
    assert str(a.ground(b, "x")) == "----\n`c\n"


def test_match() -> None:
    mp = pyds.Rule("(`p -> `q)\n`p\n`q\n")
    p = pyds.Rule("((! (! `x)) -> `x)")
    assert str(mp @ p) == "(! (! `x))\n----------\n`x\n"

    fail = pyds.Rule("`q <- `p")
    assert mp @ fail is None
