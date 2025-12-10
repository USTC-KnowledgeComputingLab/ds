import { RuleT, bufferSize } from "../atsds/index.mts";

let v = null;

beforeEach(() => {
    v = new RuleT("(a b c)");
});

test("toString", () => {
    expect(v.toString()).toBe("----\n(a b c)\n");

    const old_buffer_size = bufferSize(4);
    expect(() => v.toString()).toThrow();
    bufferSize(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("----\n(a b c)\n");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    const v2 = new RuleT(v);
    expect(v2.toString()).toBe("----\n(a b c)\n");

    expect(() => new RuleT(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new RuleT(v.value);
    expect(v2.toString()).toBe("----\n(a b c)\n");
});

test("create_from_text", () => {
    const v2 = new RuleT("(a b c)");
    expect(v2.toString()).toBe("----\n(a b c)\n");
});

test("create_from_bytes", () => {
    const v2 = new RuleT(v.data());
    expect(v2.toString()).toBe("----\n(a b c)\n");

    expect(() => new RuleT(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new RuleT(100)).toThrow();
});

test("length", () => {
    const v2 = new RuleT("(p -> q)\np\nq\n");
    expect(v2.length()).toBe(2);
});

test("getitem", () => {
    const v2 = new RuleT("(p -> q)\np\nq\n");
    expect(v2.getitem(0).toString()).toBe("(p -> q)");
    expect(v2.getitem(1).toString()).toBe("p");

    expect(() => v2.getitem(-1)).toThrow();
    expect(() => v2.getitem(2)).toThrow();
});

test("conclusion", () => {
    const v2 = new RuleT("(p -> q)\np\nq\n");
    expect(v2.conclusion().toString()).toBe("q");
});

test("ground_simple", () => {
    const a = new RuleT("`a");
    const b = new RuleT("((`a b))");
    expect(a.ground(b).toString()).toBe("----\nb\n");

    expect(a.ground(new RuleT("((`a b c d e))"))).toBeNull();
});

test("ground_scope", () => {
    const a = new RuleT("`a");
    const b = new RuleT("((x y `a `b) (y x `b `c))");
    expect(a.ground(b, "x").toString()).toBe("----\n`c\n");
});

test("match", () => {
    const mp = new RuleT("(`p -> `q)\n`p\n`q\n");
    const pq = new RuleT("((! (! `x)) -> `x)");
    expect(mp.match(pq).toString()).toBe("(! (! `x))\n----------\n`x\n");

    fail = new RuleT("(`q <- `p)");
    expect(mp.match(fail)).toBeNull();
});

test("rename_simple", () => {
    const a = new RuleT("`x");
    const b = new RuleT("((pre_) (_suf))");
    expect(a.rename(b).toString()).toBe("----\n`pre_x_suf\n");
});

test("rename_empty_prefix", () => {
    const a = new RuleT("`x");
    const b = new RuleT("(() (_suf))");
    expect(a.rename(b).toString()).toBe("----\n`x_suf\n");
});

test("rename_empty_suffix", () => {
    const a = new RuleT("`x");
    const b = new RuleT("((pre_) ())");
    expect(a.rename(b).toString()).toBe("----\n`pre_x\n");
});

test("rename_with_premises", () => {
    const a = new RuleT("`p\n`q\n----------\n`r\n");
    const b = new RuleT("((pre_) (_suf))");
    expect(a.rename(b).toString()).toBe("`pre_p_suf\n`pre_q_suf\n----------\n`pre_r_suf\n");
});

test("rename_invalid", () => {
    const a = new RuleT("`x");
    const b = new RuleT("item");
    expect(a.rename(b)).toBeNull();
});
