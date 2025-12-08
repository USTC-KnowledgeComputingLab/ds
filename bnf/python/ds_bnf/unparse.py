"""
Unparse: Convert from lisp-like Ds syntax to traditional Dsp syntax
"""

from antlr4 import InputStream, CommonTokenStream
from .generated.DsLexer import DsLexer
from .generated.DsParser import DsParser
from .generated.DsVisitor import DsVisitor


class UnparseVisitor(DsVisitor):
    """Visitor to convert from lisp-like Ds syntax to traditional Dsp syntax"""

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
        conclusion = result.pop()

        if not result:
            return conclusion

        return ", ".join(result) + " -> " + conclusion

    def visitSymbol(self, ctx):
        return ctx.SYMBOL().getText()

    def visitSubscript(self, ctx):
        terms = ctx.term()
        if not terms:
            return ""

        base = self.visit(terms[0])
        indices = ", ".join(self.visit(t) for t in terms[1:])
        return f"{base}[{indices}]"

    def visitFunction(self, ctx):
        terms = ctx.term()
        if not terms:
            return ""

        func = self.visit(terms[0])
        args = ", ".join(self.visit(t) for t in terms[1:])
        return f"{func}({args})"

    def visitUnary(self, ctx):
        op = ctx.SYMBOL().getText()
        operand = self.visit(ctx.term(0))
        return f"{op} {operand}"

    def visitBinary(self, ctx):
        op = ctx.SYMBOL().getText()
        left = self.visit(ctx.term(0))
        right = self.visit(ctx.term(1))
        return f"({left} {op} {right})"


def unparse(input_text: str) -> str:
    """
    Convert from lisp-like Ds syntax to traditional Dsp syntax

    Args:
        input_text: Input text in Ds syntax

    Returns:
        Output text in Dsp syntax
    """
    input_stream = InputStream(input_text)
    lexer = DsLexer(input_stream)
    token_stream = CommonTokenStream(lexer)
    parser = DsParser(token_stream)
    tree = parser.rule_pool()
    visitor = UnparseVisitor()
    return visitor.visit(tree)
