import pytest
import copy
import pyds


@pytest.fixture
def i() -> pyds.Item:
    return pyds.Item("item")


def test_str(i: pyds.Item) -> None:
    assert str(i) == "item"

    with pyds.scoped_buffer_size(4):
        with pytest.raises(ValueError):
            str(i)


def test_repr(i: pyds.Item) -> None:
    assert repr(i) == "Item[item]"


def test_copy_hash_and_equality(i: pyds.Item) -> None:
    other = copy.copy(i)
    assert other == i
    assert hash(other) == hash(i)
    assert 1 != i


def test_create_from_same(i: pyds.Item) -> None:
    item = pyds.Item(i)
    assert str(item) == "item"

    with pytest.raises(ValueError):
        item = pyds.Item(i, 100)


def test_create_from_base(i: pyds.Item) -> None:
    item = pyds.Item(i.value)
    assert str(item) == "item"


def test_create_from_text() -> None:
    item = pyds.Item("item")
    assert str(item) == "item"

    # item never fails


def test_create_from_bytes(i: pyds.Item) -> None:
    item = pyds.Item(i.data())
    assert str(item) == "item"

    with pytest.raises(ValueError):
        item = pyds.Item(i.data(), 100)


def test_create_fail() -> None:
    with pytest.raises(TypeError):
        item = pyds.Item(100)


def test_name(i: pyds.Item) -> None:
    assert str(i.name) == "item"
