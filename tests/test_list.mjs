/* jshint esversion: 6 */

import { list_t, buffer_size } from "../jsds/jsds.mjs";

let v = null;

beforeEach(() => {
    v = new list_t("(a b c)");
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
    let v2 = new list_t(v);
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new list_t(v, 100)).toThrow();
});

test("create_from_base", () => {
    let v2 = new list_t(v.value);
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_text", () => {
    let v2 = new list_t("(a b c)");
    expect(v2.toString()).toBe("(a b c)");
});

test("create_from_bytes", () => {
    let v2 = new list_t(v.data());
    expect(v2.toString()).toBe("(a b c)");

    expect(() => new list_t(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new list_t(100)).toThrow();
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
