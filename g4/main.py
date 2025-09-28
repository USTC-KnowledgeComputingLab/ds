__all__ = ["parse"]

from antlr4 import InputStream, CommonTokenStream
from DsLexer import DsLexer
from DsParser import DsParser
from DsVisitor import DsVisitor


class Visitor(DsVisitor):
    def visitRule_pool(self, ctx: DsParser.Rule_poolContext):
        return "\n\n".join([self.visit(r) for r in ctx.rule_()])

    def visitRule(self, ctx: DsParser.RuleContext):
        result = [self.visit(t) for t in ctx.term()]
        if len(result) == 1:
            return result[0]
        else:
            conclusion = result.pop()
            length = max(len(premise) for premise in result)
            result.append("-" * max(length, 4))
            result.append(conclusion)
            return "\n".join(result)

    def visitSymbol(self, ctx: DsParser.SymbolContext):
        return ctx.SYMBOL().getText()

    def visitParentheses(self, ctx: DsParser.ParenthesesContext):
        return self.visit(ctx.term())

    def visitSubscript(self, ctx: DsParser.SubscriptContext):
        return f"(subscript {' '.join(self.visit(t) for t in ctx.term())})"

    def visitFunction(self, ctx: DsParser.FunctionContext):
        return f"(function {' '.join(self.visit(t) for t in ctx.term())})"

    def visitUnary(self, ctx: DsParser.UnaryContext):
        return f"(unary {ctx.getChild(0).getText()} {self.visit(ctx.term())})"

    def visitBinary(self, ctx: DsParser.BinaryContext):
        return f"(binary {ctx.getChild(1).getText()} {self.visit(ctx.term(0))} {self.visit(ctx.term(1))})"


def parse(string):
    input_stream = InputStream(string)
    lexer = DsLexer(input_stream)
    stream = CommonTokenStream(lexer)
    parser = DsParser(stream)
    tree = parser.rule_pool()
    visitor = Visitor()
    return visitor.visit(tree)
