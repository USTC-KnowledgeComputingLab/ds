/* jshint esversion: 6 */

import { string_t, buffer_size } from "../jsds/jsds.mjs";

let v = null;

beforeEach(() => {
    v = new string_t("string");
});

test("toString", () => {
    expect(v.toString()).toBe("string");

    const old_buffer_size = buffer_size(4);
    expect(() => v.toString()).toThrow();
    buffer_size(old_buffer_size);
});

test("copy", () => {
    expect(v.copy().toString()).toBe("string");
});

test("key", () => {
    expect(v.copy().key()).toBe(v.key());
});

test("create_from_same", () => {
    let v2 = new string_t(v);
    expect(v2.toString()).toBe("string");

    expect(() => new string_t(v, 100)).toThrow();
});

test("create_from_base", () => {
    let v2 = new string_t(v.value);
    expect(v2.toString()).toBe("string");
});

test("create_from_text", () => {
    let v2 = new string_t("string");
    expect(v2.toString()).toBe("string");
});

test("create_from_bytes", () => {
    let v2 = new string_t(v.data());
    expect(v2.toString()).toBe("string");

    expect(() => new string_t(v.data(), 100)).toThrow();
});

test("create_fail", () => {
    expect(() => new string_t(100)).toThrow();
});
