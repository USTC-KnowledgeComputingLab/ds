from apyds_bnf import parse, unparse


def test_parse_simple_rule() -> None:
    """Test parsing a simple rule with premises and conclusion"""
    dsp_input = "a, b -> c"
    ds_output = parse(dsp_input)
    expected = "a\nb\n----\nc"
    assert ds_output == expected


def test_parse_no_premises() -> None:
    """Test parsing a rule with no premises (axiom)"""
    dsp_input = "a"
    ds_output = parse(dsp_input)
    expected = "----\na"
    assert ds_output == expected


def test_parse_function() -> None:
    """Test parsing a function call"""
    dsp_input = "f(a, b) -> c"
    ds_output = parse(dsp_input)
    expected = "(function f a b)\n----------------\nc"
    assert ds_output == expected


def test_parse_subscript() -> None:
    """Test parsing subscript notation"""
    dsp_input = "a[i, j] -> b"
    ds_output = parse(dsp_input)
    expected = "(subscript a i j)\n-----------------\nb"
    assert ds_output == expected


def test_parse_binary_operator() -> None:
    """Test parsing binary operators"""
    dsp_input = "(a + b) -> c"
    ds_output = parse(dsp_input)
    expected = "(binary + a b)\n--------------\nc"
    assert ds_output == expected


def test_parse_unary_operator() -> None:
    """Test parsing unary operators"""
    dsp_input = "~ a -> b"
    ds_output = parse(dsp_input)
    expected = "(unary ~ a)\n-----------\nb"
    assert ds_output == expected


def test_parse_multiple_rules() -> None:
    """Test parsing multiple rules"""
    dsp_input = "a -> b\n\nc -> d"
    ds_output = parse(dsp_input)
    expected = "a\n----\nb\n\nc\n----\nd"
    assert ds_output == expected


def test_unparse_simple_rule() -> None:
    """Test unparsing a simple rule"""
    ds_input = "a\nb\n----\nc"
    dsp_output = unparse(ds_input)
    expected = "a, b -> c"
    assert dsp_output == expected


def test_unparse_no_premises() -> None:
    """Test unparsing a rule with no premises"""
    ds_input = "----\na"
    dsp_output = unparse(ds_input)
    expected = " -> a"
    assert dsp_output == expected


def test_unparse_function() -> None:
    """Test unparsing a function"""
    ds_input = "(function f a b)\n----\nc"
    dsp_output = unparse(ds_input)
    expected = "f(a, b) -> c"
    assert dsp_output == expected


def test_unparse_subscript() -> None:
    """Test unparsing subscript notation"""
    ds_input = "(subscript a i j)\n----\nb"
    dsp_output = unparse(ds_input)
    expected = "a[i, j] -> b"
    assert dsp_output == expected


def test_unparse_binary_operator() -> None:
    """Test unparsing binary operators"""
    ds_input = "(binary + a b)\n----\nc"
    dsp_output = unparse(ds_input)
    expected = "(a + b) -> c"
    assert dsp_output == expected


def test_unparse_unary_operator() -> None:
    """Test unparsing unary operators"""
    # First parse a unary operator to get proper DS format
    dsp_input = "~ a -> b"
    ds_intermediate = parse(dsp_input)
    # Then unparse it back
    dsp_output = unparse(ds_intermediate)
    # Should get back the original with proper formatting
    expected = "(~ a) -> b"
    assert dsp_output == expected


def test_unparse_multiple_rules() -> None:
    """Test unparsing multiple rules"""
    ds_input = "a\n----\nb\n\nc\n----\nd"
    dsp_output = unparse(ds_input)
    expected = "a -> b\nc -> d"
    assert dsp_output == expected


def test_roundtrip_parse_unparse() -> None:
    """Test that parse followed by unparse produces consistent results"""
    dsp_original = "a, b -> c"
    ds_intermediate = parse(dsp_original)
    dsp_result = unparse(ds_intermediate)
    assert dsp_result == dsp_original


def test_roundtrip_unparse_parse() -> None:
    """Test that unparse followed by parse produces consistent results"""
    ds_original = "a\nb\n----\nc"
    dsp_intermediate = unparse(ds_original)
    ds_result = parse(dsp_intermediate)
    assert ds_result == ds_original


def test_parse_complex_expression() -> None:
    """Test parsing complex nested expressions"""
    dsp_input = "(a + b) * c, d[i] -> f(g, h)"
    ds_output = parse(dsp_input)
    expected = "(binary * (binary + a b) c)\n(subscript d i)\n---------------------------\n(function f g h)"
    assert ds_output == expected


def test_unparse_complex_expression() -> None:
    """Test unparsing complex nested expressions"""
    ds_input = "(binary * (binary + a b) c)\n(subscript d i)\n----\n(function f g h)"
    dsp_output = unparse(ds_input)
    expected = "((a + b) * c), d[i] -> f(g, h)"
    assert dsp_output == expected


def test_parse_unary_with_space() -> None:
    """Test parsing unary operators with proper spacing to trigger visitUnary"""
    dsp_input = "~ a -> b"
    ds_output = parse(dsp_input)
    expected = "(unary ~ a)\n-----------\nb"
    assert ds_output == expected


def test_unparse_unary_explicit() -> None:
    """Test unparsing explicit (unary ...) format to trigger visitUnary"""
    ds_input = "(unary ~ a)\n----\nb"
    dsp_output = unparse(ds_input)
    expected = "(~ a) -> b"
    assert dsp_output == expected


def test_roundtrip_unary_operators() -> None:
    """Test roundtrip for various unary operators"""
    test_cases = [
        ("~ a -> b", "(unary ~ a)\n-----------\nb", "(~ a) -> b"),
        ("! x -> y", "(unary ! x)\n-----------\ny", "(! x) -> y"),
        ("- n -> m", "(unary - n)\n-----------\nm", "(- n) -> m"),
        ("+ p -> q", "(unary + p)\n-----------\nq", "(+ p) -> q"),
    ]
    for dsp_original, expected_ds, expected_dsp in test_cases:
        ds_intermediate = parse(dsp_original)
        assert ds_intermediate == expected_ds
        dsp_result = unparse(ds_intermediate)
        assert dsp_result == expected_dsp
        # Parse again to ensure it's valid
        ds_final = parse(dsp_result)
        assert ds_final == expected_ds
