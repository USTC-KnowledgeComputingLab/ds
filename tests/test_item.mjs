import { item_t, buffer_size } from "../jsds/jsds.mjs";

let v = null;

beforeEach(() => {
    v = new item_t("item");
});

test("toString", () => {
    expect(v.toString()).toBe("item");

    const old_buffer_size = buffer_size(4);
    expect(() => v.toString()).toThrow();
    buffer_size(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("item");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    let v2 = new item_t(v);
    expect(v2.toString()).toBe("item");

    expect(() => new item_t(v, 100)).toThrow();
});

test("create_from_base", () => {
    let v2 = new item_t(v.value);
    expect(v2.toString()).toBe("item");
});

test("create_from_text", () => {
    let v2 = new item_t("item");
    expect(v2.toString()).toBe("item");
});

test("create_from_bytes", () => {
    let v2 = new item_t(v.data());
    expect(v2.toString()).toBe("item");

    expect(() => new item_t(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new item_t(100)).toThrow();
});

test("name", () => {
    expect(v.name().toString()).toBe("item");
});
