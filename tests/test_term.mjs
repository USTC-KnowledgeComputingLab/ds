import { list_t, item_t, variable_t, term_t, buffer_size } from "../atsds/index.mts";

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
    const v2 = new term_t(v);
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new term_t(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new term_t(v.value);
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_text", () => {
    const v2 = new term_t("(a b c)");
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_bytes", () => {
    const v2 = new term_t(v.data());
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
    const a = new term_t("`a");
    const b = new term_t("((`a b))");
    expect(a.ground(b).toString()).toBe("b");

    expect(a.ground(new term_t("((`a b c d e))"))).toBeNull();
});

test("ground_scope", () => {
    const a = new term_t("`a");
    const b = new term_t("((x y `a `b) (y x `b `c))");
    expect(a.ground(b, "x").toString()).toBe("`c");
});

test("rename_simple", () => {
    const a = new term_t("`x");
    const b = new term_t("((pre_) (_suf))");
    expect(a.rename(b).toString()).toBe("`pre_x_suf");
});

test("rename_empty_prefix", () => {
    const a = new term_t("`x");
    const b = new term_t("(() (_suf))");
    expect(a.rename(b).toString()).toBe("`x_suf");
});

test("rename_empty_suffix", () => {
    const a = new term_t("`x");
    const b = new term_t("((pre_) ())");
    expect(a.rename(b).toString()).toBe("`pre_x");
});

test("rename_list", () => {
    const a = new term_t("(`x `y)");
    const b = new term_t("((p_) (_s))");
    expect(a.rename(b).toString()).toBe("(`p_x_s `p_y_s)");
});

test("rename_invalid", () => {
    const a = new term_t("`x");
    const b = new term_t("item");
    expect(a.rename(b)).toBeNull();
});

test("match_simple", () => {
    const a = new term_t("`a");
    const b = new term_t("b");
    const result = a.match(b);
    expect(result).not.toBeNull();
    // Result format is ((scope_1 scope_2 key value)) where scopes are empty strings
    expect(result.toString()).toBe("((  `a b))");
});

test("match_complex", () => {
    const a = new term_t("(f `x a)");
    const b = new term_t("(f b a)");
    const result = a.match(b);
    expect(result).not.toBeNull();
    expect(result.toString()).toBe("((  `x b))");
});

test("match_fail", () => {
    const a = new term_t("(f `x)");
    const b = new term_t("(g `y)");
    const result = a.match(b);
    expect(result).toBeNull();
});

test("match_with_scopes", () => {
    const a = new term_t("`a");
    const b = new term_t("`b");
    const result = a.match(b, "scope1", "scope2");
    expect(result).not.toBeNull();
    // Format: ((scope1 scope2 `a `b))
    expect(result.toString()).toBe("((scope1 scope2 `a `b))");
});


