import { StringT, bufferSize } from "../atsds/index.mts";

let v = null;

beforeEach(() => {
    v = new StringT("string");
});

test("toString", () => {
    expect(v.toString()).toBe("string");

    const old_buffer_size = bufferSize(4);
    expect(() => v.toString()).toThrow();
    bufferSize(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("string");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    const v2 = new StringT(v);
    expect(v2.toString()).toBe("string");

    expect(() => new StringT(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new StringT(v.value);
    expect(v2.toString()).toBe("string");
});

test("create_from_text", () => {
    const v2 = new StringT("string");
    expect(v2.toString()).toBe("string");
});

test("create_from_bytes", () => {
    const v2 = new StringT(v.data());
    expect(v2.toString()).toBe("string");

    expect(() => new StringT(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new StringT(100)).toThrow();
});
