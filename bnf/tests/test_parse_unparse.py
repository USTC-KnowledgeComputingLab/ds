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
    dsp_input = "a -> b\nc -> d"
    ds_output = parse(dsp_input)
    expected = "a\n----\nb\n\nc\n----\nd"
    assert ds_output == expected


def test_parse_complex_expression() -> None:
    """Test parsing complex nested expressions"""
    dsp_input = "(a + b) * c, d[i] -> f(g, h)"
    ds_output = parse(dsp_input)
    expected = "(binary * (binary + a b) c)\n(subscript d i)\n---------------------------\n(function f g h)"
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
    ds_input = "(unary ~ a)\n----\nb"
    dsp_output = unparse(ds_input)
    expected = "(~ a) -> b"
    assert dsp_output == expected


def test_unparse_multiple_rules() -> None:
    """Test unparsing multiple rules"""
    ds_input = "a\n----\nb\n\nc\n----\nd"
    dsp_output = unparse(ds_input)
    expected = "a -> b\nc -> d"
    assert dsp_output == expected


def test_unparse_complex_expression() -> None:
    """Test unparsing complex nested expressions"""
    ds_input = "(binary * (binary + a b) c)\n(subscript d i)\n----\n(function f g h)"
    dsp_output = unparse(ds_input)
    expected = "((a + b) * c), d[i] -> f(g, h)"
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


def test_parse_error_missing_closing_parenthesis() -> None:
    """Test that parse throws error on missing closing parenthesis"""
    dsp_input = "(a + b -> c"
    try:
        parse(dsp_input)
        assert False, "Expected exception to be raised"
    except Exception as e:
        assert "line 1:7" in str(e)
        assert "no viable alternative" in str(e)


def test_parse_error_bad_syntax() -> None:
    """Test that parse throws error on bad syntax"""
    dsp_input = "a b c -> -> d"
    try:
        parse(dsp_input)
        assert False, "Expected exception to be raised"
    except Exception as e:
        assert "line 1:2" in str(e)
        assert "mismatched input" in str(e)


def test_parse_error_malformed_parentheses() -> None:
    """Test that parse throws error on malformed parentheses"""
    dsp_input = "()()()"
    try:
        parse(dsp_input)
        assert False, "Expected exception to be raised"
    except Exception as e:
        assert "line 1:1" in str(e)
        assert "no viable alternative" in str(e)


def test_unparse_error_incomplete_binary() -> None:
    """Test that unparse throws error on incomplete binary expression"""
    ds_input = "(binary"
    try:
        unparse(ds_input)
        assert False, "Expected exception to be raised"
    except Exception as e:
        assert "line 1:7" in str(e)
        assert "mismatched input" in str(e)


def test_unparse_error_malformed_function() -> None:
    """Test that unparse throws error on malformed function"""
    ds_input = "(function"
    try:
        unparse(ds_input)
        assert False, "Expected exception to be raised"
    except Exception as e:
        assert "line 1:9" in str(e)
        assert "mismatched input" in str(e)
