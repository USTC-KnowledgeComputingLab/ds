import { rule_t, buffer_size } from "../atsds/tsds.mts";

let v = null;

beforeEach(() => {
    v = new rule_t("(a b c)");
});

test("toString", () => {
    expect(v.toString()).toBe("----\n(a b c)\n");

    const old_buffer_size = buffer_size(4);
    expect(() => v.toString()).toThrow();
    buffer_size(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("----\n(a b c)\n");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    const v2 = new rule_t(v);
    expect(v2.toString()).toBe("----\n(a b c)\n");

    expect(() => new rule_t(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new rule_t(v.value);
    expect(v2.toString()).toBe("----\n(a b c)\n");
});

test("create_from_text", () => {
    const v2 = new rule_t("(a b c)");
    expect(v2.toString()).toBe("----\n(a b c)\n");
});

test("create_from_bytes", () => {
    const v2 = new rule_t(v.data());
    expect(v2.toString()).toBe("----\n(a b c)\n");

    expect(() => new rule_t(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new rule_t(100)).toThrow();
});

test("length", () => {
    const v2 = new rule_t("(p -> q)\np\nq\n");
    expect(v2.length()).toBe(2);
});

test("getitem", () => {
    const v2 = new rule_t("(p -> q)\np\nq\n");
    expect(v2.getitem(0).toString()).toBe("(p -> q)");
    expect(v2.getitem(1).toString()).toBe("p");

    expect(() => v2.getitem(-1)).toThrow();
    expect(() => v2.getitem(2)).toThrow();
});

test("conclusion", () => {
    const v2 = new rule_t("(p -> q)\np\nq\n");
    expect(v2.conclusion().toString()).toBe("q");
});

test("ground_simple", () => {
    const a = new rule_t("`a");
    const b = new rule_t("((`a b))");
    expect(a.ground(b).toString()).toBe("----\nb\n");

    expect(a.ground(new rule_t("((`a b c d e))"))).toBeNull();
});

test("ground_scope", () => {
    const a = new rule_t("`a");
    const b = new rule_t("((x y `a `b) (y x `b `c))");
    expect(a.ground(b, "x").toString()).toBe("----\n`c\n");
});

test("match", () => {
    const mp = new rule_t("(`p -> `q)\n`p\n`q\n");
    const pq = new rule_t("((! (! `x)) -> `x)");
    expect(mp.match(pq).toString()).toBe("(! (! `x))\n----------\n`x\n");

    fail = new rule_t("(`q <- `p)");
    expect(mp.match(fail)).toBeNull();
});
