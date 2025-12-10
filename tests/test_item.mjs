import { ItemT, bufferSize } from "../atsds/index.mts";

let v = null;

beforeEach(() => {
    v = new ItemT("item");
});

test("toString", () => {
    expect(v.toString()).toBe("item");

    const old_buffer_size = bufferSize(4);
    expect(() => v.toString()).toThrow();
    bufferSize(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("item");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    const v2 = new ItemT(v);
    expect(v2.toString()).toBe("item");

    expect(() => new ItemT(v, 100)).toThrow();
});

test("create_from_base", () => {
    const v2 = new ItemT(v.value);
    expect(v2.toString()).toBe("item");
});

test("create_from_text", () => {
    const v2 = new ItemT("item");
    expect(v2.toString()).toBe("item");
});

test("create_from_bytes", () => {
    const v2 = new ItemT(v.data());
    expect(v2.toString()).toBe("item");

    expect(() => new ItemT(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new ItemT(100)).toThrow();
});

test("name", () => {
    expect(v.name().toString()).toBe("item");
});
