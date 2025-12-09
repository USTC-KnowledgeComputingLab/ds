from apyds_bnf import parse, unparse


def test_parse_simple_rule():
    """Test parsing a simple rule with premises and conclusion"""
    dsp_input = "a, b -> c"
    ds_output = parse(dsp_input)
    expected = "a\nb\n----\nc"
    assert ds_output == expected


def test_parse_no_premises():
    """Test parsing a rule with no premises (axiom)"""
    dsp_input = "a"
    ds_output = parse(dsp_input)
    expected = "----\na"
    assert ds_output == expected


def test_parse_function():
    """Test parsing a function call"""
    dsp_input = "f(a, b) -> c"
    ds_output = parse(dsp_input)
    assert "(function f a b)" in ds_output
    assert "c" in ds_output


def test_parse_subscript():
    """Test parsing subscript notation"""
    dsp_input = "a[i, j] -> b"
    ds_output = parse(dsp_input)
    assert "(subscript a i j)" in ds_output
    assert "b" in ds_output


def test_parse_binary_operator():
    """Test parsing binary operators"""
    dsp_input = "(a + b) -> c"
    ds_output = parse(dsp_input)
    assert "(binary + a b)" in ds_output
    assert "c" in ds_output


def test_parse_unary_operator():
    """Test parsing unary operators"""
    dsp_input = "~a -> b"
    ds_output = parse(dsp_input)
    # Unary operators are kept as-is in Ds format
    assert "~a" in ds_output or "(unary ~ a)" in ds_output
    assert "b" in ds_output


def test_parse_multiple_rules():
    """Test parsing multiple rules"""
    dsp_input = "a -> b\n\nc -> d"
    ds_output = parse(dsp_input)
    # Should contain both rules separated by blank line
    assert "a" in ds_output
    assert "b" in ds_output
    assert "c" in ds_output
    assert "d" in ds_output


def test_unparse_simple_rule():
    """Test unparsing a simple rule"""
    ds_input = "a\nb\n----\nc"
    dsp_output = unparse(ds_input)
    expected = "a, b -> c"
    assert dsp_output == expected


def test_unparse_no_premises():
    """Test unparsing a rule with no premises"""
    ds_input = "----\na"
    dsp_output = unparse(ds_input)
    expected = " -> a"
    assert dsp_output == expected


def test_unparse_function():
    """Test unparsing a function"""
    ds_input = "(function f a b)\n----\nc"
    dsp_output = unparse(ds_input)
    expected = "f(a, b) -> c"
    assert dsp_output == expected


def test_unparse_subscript():
    """Test unparsing subscript notation"""
    ds_input = "(subscript a i j)\n----\nb"
    dsp_output = unparse(ds_input)
    expected = "a[i, j] -> b"
    assert dsp_output == expected


def test_unparse_binary_operator():
    """Test unparsing binary operators"""
    ds_input = "(binary + a b)\n----\nc"
    dsp_output = unparse(ds_input)
    expected = "(a + b) -> c"
    assert dsp_output == expected


def test_unparse_unary_operator():
    """Test unparsing unary operators"""
    # First parse a unary operator to get proper DS format
    dsp_input = "~a -> b"
    ds_intermediate = parse(dsp_input)
    # Then unparse it back
    dsp_output = unparse(ds_intermediate)
    # Should get back the original
    assert dsp_output == dsp_input


def test_unparse_multiple_rules():
    """Test unparsing multiple rules"""
    ds_input = "a\n----\nb\n\nc\n----\nd"
    dsp_output = unparse(ds_input)
    lines = dsp_output.strip().split("\n")
    assert len(lines) == 2
    assert "a -> b" in lines[0]
    assert "c -> d" in lines[1]


def test_roundtrip_parse_unparse():
    """Test that parse followed by unparse produces consistent results"""
    dsp_original = "a, b -> c"
    ds_intermediate = parse(dsp_original)
    dsp_result = unparse(ds_intermediate)
    assert dsp_result == dsp_original


def test_roundtrip_unparse_parse():
    """Test that unparse followed by parse produces consistent results"""
    ds_original = "a\nb\n----\nc"
    dsp_intermediate = unparse(ds_original)
    ds_result = parse(dsp_intermediate)
    assert ds_result == ds_original


def test_parse_complex_expression():
    """Test parsing complex nested expressions"""
    dsp_input = "(a + b) * c, d[i] -> f(g, h)"
    ds_output = parse(dsp_input)
    # Verify the structure is preserved
    assert "(binary" in ds_output
    assert "(subscript d i)" in ds_output
    assert "(function f g h)" in ds_output


def test_unparse_complex_expression():
    """Test unparsing complex nested expressions"""
    ds_input = "(binary * (binary + a b) c)\n(subscript d i)\n----\n(function f g h)"
    dsp_output = unparse(ds_input)
    # Verify the structure is preserved
    assert "+" in dsp_output
    assert "*" in dsp_output
    assert "[i]" in dsp_output
    assert "f(g, h)" in dsp_output
