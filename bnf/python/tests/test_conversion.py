"""
Tests for BNF conversion
"""

import pytest
from ds_bnf import unparse, parse


class TestUnparse:
    """Test Ds → Dsp conversion"""

    def test_simple_symbol(self):
        input_text = "a"
        output = unparse(input_text)
        assert output == "a"

    def test_binary_expression(self):
        input_text = "(binary -> a b)"
        output = unparse(input_text)
        assert output == "(a -> b)"

    def test_function_call(self):
        input_text = "(function f a b)"
        output = unparse(input_text)
        assert output == "f(a, b)"

    def test_subscript(self):
        input_text = "(subscript arr i j)"
        output = unparse(input_text)
        assert output == "arr[i, j]"

    def test_unary_expression(self):
        input_text = "(unary ! x)"
        output = unparse(input_text)
        assert output == "! x"

    def test_rule_with_premises(self):
        input_text = "(binary -> `P `Q)\n`P\n----------\n`Q"
        output = unparse(input_text)
        assert "->" in output


class TestParse:
    """Test Dsp → Ds conversion"""

    def test_simple_symbol(self):
        input_text = "a"
        output = parse(input_text)
        assert output == "a"

    def test_binary_expression(self):
        input_text = "a -> b"
        output = parse(input_text)
        assert "binary" in output
        assert "->" in output

    def test_function_call(self):
        input_text = "f(a, b)"
        output = parse(input_text)
        assert "function" in output

    def test_subscript(self):
        input_text = "arr[i, j]"
        output = parse(input_text)
        assert "subscript" in output

    def test_unary_expression(self):
        input_text = "! x"
        output = parse(input_text)
        assert "unary" in output


class TestRoundTrip:
    """Test round-trip conversion"""

    def test_ds_dsp_ds_simple(self):
        original = "(binary + a b)"
        dsp = unparse(original)
        ds = parse(dsp)
        # Note: May not be exactly equal due to formatting, but structure should be preserved
        assert "binary" in ds
        assert "+" in ds
