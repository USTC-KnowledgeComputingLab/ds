import { VariableT, bufferSize } from "../atsds/index.mts";

let v = null;

beforeEach(() => {
    v = new VariableT("`variable");
});

test("toString", () => {
    expect(v.toString()).toBe("`variable");

    const old_buffer_size = bufferSize(4);
    expect(() => v.toString()).toThrow();
    bufferSize(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("`variable");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    const v2 = new VariableT(v);
    expect(v2.toString()).toBe("`variable");

    expect(() => new VariableT(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new VariableT(v.value);
    expect(v2.toString()).toBe("`variable");
});

test("create_from_text", () => {
    const v2 = new VariableT("`variable");
    expect(v2.toString()).toBe("`variable");
});

test("create_from_bytes", () => {
    const v2 = new VariableT(v.data());
    expect(v2.toString()).toBe("`variable");

    expect(() => new VariableT(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new VariableT(100)).toThrow();
});

test("name", () => {
    expect(v.name().toString()).toBe("variable");
});
