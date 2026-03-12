import pytest
import apyds


@pytest.fixture
def chain() -> apyds.Chain:
    return apyds.Chain(100, 1000)


def test_reset_parameters(chain: apyds.Chain) -> None:
    chain.set_limit_size(50)
    chain.set_buffer_size(500)
    chain.reset()


def test_add_rule_and_fact(chain: apyds.Chain) -> None:
    assert chain.add("test rule")
    assert chain.add("fact")


def test_add_fail(chain: apyds.Chain) -> None:
    chain.set_limit_size(10)
    assert not chain.add("a-long-facts-that-exceeds-limit")


def test_execute_single_premise(chain: apyds.Chain) -> None:
    chain.add("p q")
    chain.add("p")
    target = apyds.Rule("q")
    success = False

    def callback(rule: apyds.Rule) -> bool:
        nonlocal success
        if rule == target:
            success = True
            return True
        return False

    count = chain.execute(callback)
    assert count == 1
    assert success


def test_execute_multiple_premises_chain(chain: apyds.Chain) -> None:
    # p q r means: p, q |- r (two premises)
    # In chain_t, both premises are matched in a single cycle
    chain.add("p q r")
    chain.add("p")
    chain.add("q")
    target = apyds.Rule("r")
    success = False

    def callback(rule: apyds.Rule) -> bool:
        nonlocal success
        if rule == target:
            success = True
            return True
        return False

    count = chain.execute(callback)
    assert count == 1
    assert success


def test_execute_multiple_premises_partial(chain: apyds.Chain) -> None:
    # p q r means: p, q |- r (two premises)
    # Only p, no q - chain_t won't produce partial results
    # because it's designed to match all premises in a single cycle
    chain.add("p q r")
    chain.add("p")
    count = chain.execute(lambda rule: False)
    # No result because not all premises are matched
    assert count == 0


def test_execute_three_premises(chain: apyds.Chain) -> None:
    # p q r s means: p, q, r |- s (three premises)
    # In chain_t, all three premises are matched in a single cycle
    chain.add("p q r s")
    chain.add("p")
    chain.add("q")
    chain.add("r")
    target = apyds.Rule("s")
    success = False

    def callback(rule: apyds.Rule) -> bool:
        nonlocal success
        if rule == target:
            success = True
            return True
        return False

    count = chain.execute(callback)
    assert count == 1
    assert success


def test_execute_duplicated_fact(chain: apyds.Chain) -> None:
    chain.add("p r")
    chain.add("q r")
    chain.add("p")
    chain.add("q")
    count = chain.execute(lambda rule: False)
    assert count == 1


def test_execute_exceed(chain: apyds.Chain) -> None:
    chain.set_limit_size(100)
    assert chain.add("(2 `x) (`x `x`)")
    assert chain.add("(2 a-very-long-fact-that-exceeds-half-of-the-limit-size)")
    count = chain.execute(lambda rule: False)
    assert count == 0


def test_set_max_depth(chain: apyds.Chain) -> None:
    chain.set_max_depth(2)
    # rule 有 3 个 premises，超过 max_depth，应该被拒绝
    assert not chain.add("p q r s")
    # rule 有 2 个 premises，等于 max_depth，应该被接受
    assert chain.add("p q r")


def test_set_max_depth_removes_existing_rules() -> None:
    chain = apyds.Chain(100, 1000)
    chain.add("p q r s")  # 3 个 premises
    chain.add("p q r")  # 2 个 premises
    chain.set_max_depth(2)
    # 现在只有 2 个 premises 的 rule 应该存在
    count = chain.execute(lambda rule: False)
    # 应该有结果，因为 "p q r" 还存在
    assert count > 0
