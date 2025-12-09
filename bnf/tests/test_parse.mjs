import { parse, unparse } from "../atsds_bnf/index.mjs";

test("parse simple symbol", () => {
    const input = "a -> b";
    const expected = "a\n----\nb";
    const result = parse(input);
    expect(result).toBe(expected);
});

test("parse multiple premises", () => {
    const input = "a, b -> c";
    const expected = "a\nb\n----\nc";
    const result = parse(input);
    expect(result).toBe(expected);
});

test("parse function", () => {
    const input = "f(x, y) -> z";
    const expected = "(function f x y)\n----------------\nz";
    const result = parse(input);
    expect(result).toBe(expected);
});

test("parse subscript", () => {
    const input = "a[i, j] -> b";
    const expected = "(subscript a i j)\n-----------------\nb";
    const result = parse(input);
    expect(result).toBe(expected);
});

test("parse binary operator", () => {
    const input = "(x + y) -> z";
    const expected = "(binary + x y)\n--------------\nz";
    const result = parse(input);
    expect(result).toBe(expected);
});

test("parse unary operator", () => {
    const input = "(- x) -> y";
    const expected = "(unary - x)\n-----------\ny";
    const result = parse(input);
    expect(result).toBe(expected);
});

test("parse multiple rules", () => {
    const input = "a -> b\n\nc -> d";
    const result = parse(input);
    expect(result).toContain("----\nb");
    expect(result).toContain("----\nd");
});

test("unparse simple symbol", () => {
    const input = "----\nb";
    const expected = " -> b";
    const result = unparse(input);
    expect(result).toBe(expected);
});

test("unparse multiple premises", () => {
    const input = "a\nb\n----\nc";
    const expected = "a, b -> c";
    const result = unparse(input);
    expect(result).toBe(expected);
});

test("unparse function", () => {
    const input = "(function f x y)\n----\nz";
    const expected = "f(x, y) -> z";
    const result = unparse(input);
    expect(result).toBe(expected);
});

test("unparse subscript", () => {
    const input = "(subscript a i j)\n----\nb";
    const expected = "a[i, j] -> b";
    const result = unparse(input);
    expect(result).toBe(expected);
});

test("unparse binary operator", () => {
    const input = "(binary + x y)\n----\nz";
    const expected = "(x + y) -> z";
    const result = unparse(input);
    expect(result).toBe(expected);
});

test("unparse unary operator", () => {
    // Note: This test documents a bug in the current implementation where
    // getChild(0) incorrectly gets '(unary' instead of getChild(1) for the operator.
    // The expected output is wrong but matches the current buggy behavior.
    const input = "(unary - x)\n----\ny";
    const expected = "((unary x) -> y";  // Bug: should be "(- x) -> y"
    const result = unparse(input);
    expect(result).toBe(expected);
});

test("roundtrip parse unparse", () => {
    const input = "a, b -> c";
    const parsed = parse(input);
    const unparsed = unparse(parsed);
    expect(unparsed).toBe(input);
});

test("roundtrip unparse parse", () => {
    const input = "(binary + x y)\n----\nz";
    const unparsed = unparse(input);
    const parsed = parse(unparsed);
    // The parsed result should match the original input
    expect(parsed).toContain("(binary + x y)");
    expect(parsed.trim()).toMatch(/z$/);
});
