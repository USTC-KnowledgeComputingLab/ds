import { ListT, bufferSize } from "../atsds/index.mts";

let v = null;

beforeEach(() => {
    v = new ListT("(a b c)");
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
    const v2 = new ListT(v);
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new ListT(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new ListT(v.value);
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_text", () => {
    const v2 = new ListT("(a b c)");
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_bytes", () => {
    const v2 = new ListT(v.data());
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new ListT(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new ListT(100)).toThrow();
});

test("length", () => {
    expect(v.length()).toBe(3);
});

test("getitem", () => {
    expect(v.getitem(0).toString()).toBe("a");
    expect(v.getitem(1).toString()).toBe("b");
    expect(v.getitem(2).toString()).toBe("c");

    expect(() => v.getitem(-1)).toThrow();
    expect(() => v.getitem(3)).toThrow();
});
