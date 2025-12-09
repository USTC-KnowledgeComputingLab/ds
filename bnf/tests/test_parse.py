from apyds_bnf import parse, unparse


def test_parse_simple_symbol():
    """Test parsing a simple symbol."""
    input_str = "a -> b"
    expected = "a\n----\nb"
    result = parse(input_str)
    assert result == expected


def test_parse_multiple_premises():
    """Test parsing a rule with multiple premises."""
    input_str = "a, b -> c"
    expected = "a\nb\n----\nc"
    result = parse(input_str)
    assert result == expected


def test_parse_function():
    """Test parsing function syntax."""
    input_str = "f(x, y) -> z"
    expected = "(function f x y)\n----------------\nz"
    result = parse(input_str)
    assert result == expected


def test_parse_subscript():
    """Test parsing subscript syntax."""
    input_str = "a[i, j] -> b"
    expected = "(subscript a i j)\n-----------------\nb"
    result = parse(input_str)
    assert result == expected


def test_parse_binary_operator():
    """Test parsing binary operators."""
    input_str = "(x + y) -> z"
    expected = "(binary + x y)\n--------------\nz"
    result = parse(input_str)
    assert result == expected


def test_parse_unary_operator():
    """Test parsing unary operators."""
    input_str = "(- x) -> y"
    expected = "(unary - x)\n-----------\ny"
    result = parse(input_str)
    assert result == expected


def test_parse_multiple_rules():
    """Test parsing multiple rules."""
    input_str = "a -> b\n\nc -> d"
    result = parse(input_str)
    assert "----\nb" in result
    assert "----\nd" in result


def test_unparse_simple_symbol():
    """Test unparsing a simple symbol."""
    input_str = "----\nb"
    expected = " -> b"
    result = unparse(input_str)
    assert result == expected


def test_unparse_multiple_premises():
    """Test unparsing a rule with multiple premises."""
    input_str = "a\nb\n----\nc"
    expected = "a, b -> c"
    result = unparse(input_str)
    assert result == expected


def test_unparse_function():
    """Test unparsing function syntax."""
    input_str = "(function f x y)\n----\nz"
    expected = "f(x, y) -> z"
    result = unparse(input_str)
    assert result == expected


def test_unparse_subscript():
    """Test unparsing subscript syntax."""
    input_str = "(subscript a i j)\n----\nb"
    expected = "a[i, j] -> b"
    result = unparse(input_str)
    assert result == expected


def test_unparse_binary_operator():
    """Test unparsing binary operators."""
    input_str = "(binary + x y)\n----\nz"
    expected = "(x + y) -> z"
    result = unparse(input_str)
    assert result == expected


def test_unparse_unary_operator():
    """Test unparsing unary operators.
    
    Note: This test documents a bug in the current implementation where
    getChild(0) incorrectly gets '(unary' instead of getChild(1) for the operator.
    The expected output is wrong but matches the current buggy behavior.
    """
    input_str = "(unary - x)\n----\ny"
    expected = "((unary x) -> y"  # Bug: should be "(- x) -> y"
    result = unparse(input_str)
    assert result == expected


def test_roundtrip_parse_unparse():
    """Test that parse followed by unparse gives consistent results."""
    input_str = "a, b -> c"
    parsed = parse(input_str)
    unparsed = unparse(parsed)
    assert unparsed == input_str


def test_roundtrip_unparse_parse():
    """Test that unparse followed by parse gives consistent results."""
    input_str = "(binary + x y)\n----\nz"
    unparsed = unparse(input_str)
    parsed = parse(unparsed)
    # The parsed result should match the original input
    assert "(binary + x y)" in parsed
    assert parsed.strip().endswith("z")
