/* jshint esversion: 6 */

import {
    list_t,
    item_t,
    variable_t,
    term_t,
    buffer_size
} from "../jsds/jsds.mts";

let v = null;

beforeEach(() => {
    v = new term_t("(a b c)");
});

test("toString", () => {
    expect(v.toString()).toBe("(a b c)");

    const old_buffer_size = buffer_size(4);
    expect(() => v.toString()).toThrow();
    buffer_size(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("(a b c)");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    let v2 = new term_t(v);
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new term_t(v, 100)).toThrow();
});

test("create_from_base", () => {
    let v2 = new term_t(v.value);
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_text", () => {
    let v2 = new term_t("(a b c)");
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_bytes", () => {
    let v2 = new term_t(v.data());
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new term_t(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new term_t(100)).toThrow();
});

test("term", () => {
    expect(new term_t("()").term()).toBeInstanceOf(list_t);
    expect(new term_t("a").term()).toBeInstanceOf(item_t);
    expect(new term_t("`a").term()).toBeInstanceOf(variable_t);
});

test("ground_simple", () => {
    let a = new term_t("`a");
    let b = new term_t("((`a b))");
    expect(a.ground(b).toString()).toBe("b");

    expect(a.ground(new term_t("((`a b c d e))"))).toBeNull();
});

test("ground_scope", () => {
    let a = new term_t("`a");
    let b = new term_t("((x y `a `b) (y x `b `c))");
    expect(a.ground(b, "x").toString()).toBe("`c");
});
