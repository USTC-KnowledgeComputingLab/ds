import { ListT, ItemT, VariableT, TermT, bufferSize } from "../atsds/index.mts";

let v = null;

beforeEach(() => {
    v = new TermT("(a b c)");
});

test("toString", () => {
    expect(v.toString()).toBe("(a b c)");

    const old_buffer_size = bufferSize(4);
    expect(() => v.toString()).toThrow();
    bufferSize(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("(a b c)");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    const v2 = new TermT(v);
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new TermT(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new TermT(v.value);
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_text", () => {
    const v2 = new TermT("(a b c)");
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_bytes", () => {
    const v2 = new TermT(v.data());
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new TermT(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new TermT(100)).toThrow();
});

test("term", () => {
    expect(new TermT("()").term()).toBeInstanceOf(ListT);
    expect(new TermT("a").term()).toBeInstanceOf(ItemT);
    expect(new TermT("`a").term()).toBeInstanceOf(VariableT);
});

test("ground_simple", () => {
    const a = new TermT("`a");
    const b = new TermT("((`a b))");
    expect(a.ground(b).toString()).toBe("b");

    expect(a.ground(new TermT("((`a b c d e))"))).toBeNull();
});

test("ground_scope", () => {
    const a = new TermT("`a");
    const b = new TermT("((x y `a `b) (y x `b `c))");
    expect(a.ground(b, "x").toString()).toBe("`c");
});

test("rename_simple", () => {
    const a = new TermT("`x");
    const b = new TermT("((pre_) (_suf))");
    expect(a.rename(b).toString()).toBe("`pre_x_suf");
});

test("rename_empty_prefix", () => {
    const a = new TermT("`x");
    const b = new TermT("(() (_suf))");
    expect(a.rename(b).toString()).toBe("`x_suf");
});

test("rename_empty_suffix", () => {
    const a = new TermT("`x");
    const b = new TermT("((pre_) ())");
    expect(a.rename(b).toString()).toBe("`pre_x");
});

test("rename_list", () => {
    const a = new TermT("(`x `y)");
    const b = new TermT("((p_) (_s))");
    expect(a.rename(b).toString()).toBe("(`p_x_s `p_y_s)");
});

test("rename_invalid", () => {
    const a = new TermT("`x");
    const b = new TermT("item");
    expect(a.rename(b)).toBeNull();
});
