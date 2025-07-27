import pytest
import pyds


@pytest.fixture
def search() -> pyds.Search:
    return pyds.Search(100, 1000)


def test_reset_parameters(search: pyds.Search) -> None:
    search.set_limit_size(50)
    search.set_buffer_size(500)
    search.reset()


def test_add_rule_and_fact(search: pyds.Search) -> None:
    assert search.add("test rule")
    assert search.add("fact")


def test_add_fail(search: pyds.Search) -> None:
    search.set_limit_size(10)
    assert not search.add("a-long-facts-that-exceeds-limit")


def test_execute_single(search: pyds.Search) -> None:
    search.add("p q")
    search.add("p")
    target = pyds.Rule("q")
    success = False

    def callback(rule: pyds.Rule) -> bool:
        nonlocal success
        if rule == target:
            success = True
            return True
        return False

    count = search.execute(callback)
    assert count == 1
    assert success


def test_execute_long(search: pyds.Search) -> None:
    search.add("p q r")
    search.add("p")
    search.add("q")
    target1 = pyds.Rule("q r")
    target2 = pyds.Rule("r")
    success1 = False
    success2 = False

    def callback1(rule: pyds.Rule) -> bool:
        if rule == target1:
            nonlocal success1
            success1 = True
        return False

    def callback2(rule: pyds.Rule) -> bool:
        if rule == target2:
            nonlocal success2
            success2 = True
        return False

    count1 = search.execute(callback1)
    count2 = search.execute(callback2)
    assert count1 == 1
    assert success1
    assert count2 == 1
    assert success2


def test_execute_duplicated_fact(search: pyds.Search) -> None:
    search.add("p r")
    search.add("q r")
    search.add("p")
    search.add("q")
    count = search.execute(lambda rule: False)
    assert count == 1


def test_execute_duplicate_rule(search: pyds.Search) -> None:
    search.add("p r s")
    search.add("p r s")
    search.add("p")
    search.add("q")
    count = search.execute(lambda rule: False)
    assert count == 1


def test_execute_exceed(search: pyds.Search) -> None:
    search.set_limit_size(100)
    assert search.add("(2 `x) (`x `x`)")
    assert search.add("(2 a-very-long-fact-that-exceeds-half-of-the-limit-size)")
    count = search.execute(lambda rule: False)
    assert count == 0
