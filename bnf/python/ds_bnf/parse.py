"""
Parse: Convert from traditional Dsp syntax to lisp-like Ds syntax
"""

from antlr4 import InputStream, CommonTokenStream
from .generated.DspLexer import DspLexer
from .generated.DspParser import DspParser
from .generated.DspVisitor import DspVisitor


class ParseVisitor(DspVisitor):
    """Visitor to convert from traditional Dsp syntax to lisp-like Ds syntax"""

    def visitRule_pool(self, ctx):
        rules = ctx.rule_()
        if not rules:
            return ""
        return "\n".join(self.visit(r) for r in rules)

    def visitRule(self, ctx):
        terms = ctx.term()
        if not terms:
            return ""

        result = [self.visit(t) for t in terms]

        # Check if this is a rule with arrow (->)
        text = ctx.getText()
        if "->" in text:
            # Multiple premises with conclusion
            conclusion = result.pop()
            return "\n".join(result) + "\n----------\n" + conclusion
        else:
            # Just a fact (single term)
            return result[0]

    def visitSymbol(self, ctx):
        return ctx.SYMBOL().getText()

    def visitParentheses(self, ctx):
        return self.visit(ctx.term(0))

    def visitSubscript(self, ctx):
        terms = ctx.term()
        base = self.visit(terms[0])
        indices = " ".join(self.visit(t) for t in terms[1:])
        return f"(subscript {base} {indices})"

    def visitFunction(self, ctx):
        terms = ctx.term()
        func = self.visit(terms[0])
        args = " ".join(self.visit(t) for t in terms[1:])

        if not args:
            return f"(function {func})"
        return f"(function {func} {args})"

    def visitUnary(self, ctx):
        op = ctx.getChild(0).getText()
        operand = self.visit(ctx.term(0))
        return f"(unary {op} {operand})"

    def visitBinary(self, ctx):
        terms = ctx.term()
        left = self.visit(terms[0])
        right = self.visit(terms[1])

        # Find the operator - it's the token between the two terms
        # Iterate through children to find terminal nodes (operators)
        op = ""
        for i in range(ctx.getChildCount()):
            child = ctx.getChild(i)
            # Check if this is a terminal node (has a symbol attribute)
            if hasattr(child, 'symbol'):
                op = child.getText()
                break
            else:
                text = child.getText()
                # Skip if it matches term outputs
                if text != left and text != right and "(" not in text and len(text) > 0:
                    op = text
                    break

        return f"(binary {op} {left} {right})"


def parse(input_text: str) -> str:
    """
    Convert from traditional Dsp syntax to lisp-like Ds syntax

    Args:
        input_text: Input text in Dsp syntax

    Returns:
        Output text in Ds syntax
    """
    input_stream = InputStream(input_text)
    lexer = DspLexer(input_stream)
    token_stream = CommonTokenStream(lexer)
    parser = DspParser(token_stream)
    tree = parser.rule_pool()
    visitor = ParseVisitor()
    return visitor.visit(tree)
