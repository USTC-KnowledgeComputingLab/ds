import { Chain, Rule } from "../atsds/index.mts";

let chain = null;

beforeEach(() => {
    chain = new Chain(100, 1000);
});

test("reset_parameters", () => {
    chain.set_limit_size(50);
    chain.set_buffer_size(500);
    chain.reset();
});

test("add_rule_and_fact", () => {
    expect(chain.add("test rule")).toBe(true);
    expect(chain.add("fact")).toBe(true);
});

test("add_fail", () => {
    chain.set_limit_size(10);
    expect(chain.add("a-long-facts-that-exceeds-limit")).toBe(false);
});

test("execute_single_premise", () => {
    chain.add("p q");
    chain.add("p");
    const target = new Rule("q");
    let success = false;
    const count = chain.execute((rule) => {
        if (rule.key() === target.key()) {
            success = true;
            return true;
        }
        return false;
    });
    expect(count).toBe(1);
    expect(success).toBe(true);
});

test("execute_multiple_premises_chain", () => {
    // p q r means: p, q |- r (two premises)
    // In chain_t, both premises are matched in a single cycle
    chain.add("p q r");
    chain.add("p");
    chain.add("q");
    const target = new Rule("r");
    let success = false;
    const count = chain.execute((rule) => {
        if (rule.key() === target.key()) {
            success = true;
            return true;
        }
        return false;
    });
    expect(count).toBe(1);
    expect(success).toBe(true);
});

test("execute_multiple_premises_partial", () => {
    // p q r means: p, q |- r (two premises)
    // Only p, no q - chain_t won't produce partial results
    // because it's designed to match all premises in a single cycle
    chain.add("p q r");
    chain.add("p");
    const count = chain.execute((rule) => false);
    // No result because not all premises are matched
    expect(count).toBe(0);
});

test("execute_three_premises", () => {
    // p q r s means: p, q, r |- s (three premises)
    // In chain_t, all three premises are matched in a single cycle
    chain.add("p q r s");
    chain.add("p");
    chain.add("q");
    chain.add("r");
    const target = new Rule("s");
    let success = false;
    const count = chain.execute((rule) => {
        if (rule.key() === target.key()) {
            success = true;
            return true;
        }
        return false;
    });
    expect(count).toBe(1);
    expect(success).toBe(true);
});

test("execute_duplicated_fact", () => {
    chain.add("p r");
    chain.add("q r");
    chain.add("p");
    chain.add("q");
    const count = chain.execute((rule) => false);
    expect(count).toBe(1);
});

test("execute_exceed", () => {
    chain.set_limit_size(100);
    expect(chain.add("(2 `x) (`x `x`)")).toBe(true);
    expect(chain.add("(2 a-very-long-fact-that-exceeds-half-of-the-limit-size)")).toBe(true);
    const count = chain.execute((rule) => false);
    expect(count).toBe(0);
});

test("set_max_depth", () => {
    chain.set_max_depth(2);
    // rule has 3 premises, exceeds max_depth, should be rejected
    expect(chain.add("p q r s")).toBe(false);
    // rule has 2 premises, equals max_depth, should be accepted
    expect(chain.add("p q r")).toBe(true);
});

test("set_max_depth_removes_existing_rules", () => {
    const newChain = new Chain(100, 1000);
    newChain.add("p q r s"); // 3 premises
    newChain.add("p q r"); // 2 premises
    newChain.set_max_depth(2);
    // Now only the rule with 2 premises should exist
    // Add facts to test if the rule still exists
    newChain.add("p");
    newChain.add("q");
    const count = newChain.execute((rule) => false);
    // Should have results because "p q r" still exists (3 premises rule was removed)
    expect(count).toBeGreaterThan(0);
});
