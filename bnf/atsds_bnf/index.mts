import { InputStream, CommonTokenStream } from "antlr4";
import DspLexer from "./DspLexer.js";
import DspParser from "./DspParser.js";
import DspVisitor from "./DspVisitor.js";
import DsLexer from "./DsLexer.js";
import DsParser from "./DsParser.js";
import DsVisitor from "./DsVisitor.js";

class ParseVisitor extends DspVisitor {
    visitRule_pool(ctx: any): string {
        return ctx
            .rule_()
            .map((r: any) => this.visit(r))
            .join("\n\n");
    }

    visitRule(ctx: any): string {
        const result = ctx.term().map((t: any) => this.visit(t));
        if (result.length === 1) {
            return `----\n${result[0]}`;
        } else {
            const conclusion = result.pop();
            const length = Math.max(...result.map((premise: string) => premise.length));
            result.push("-".repeat(Math.max(length, 4)));
            result.push(conclusion);
            return result.join("\n");
        }
    }

    visitSymbol(ctx: any): string {
        return ctx.SYMBOL().getText();
    }

    visitParentheses(ctx: any): string {
        return this.visit(ctx.term());
    }

    visitSubscript(ctx: any): string {
        return `(subscript ${ctx
            .term()
            .map((t: any) => this.visit(t))
            .join(" ")})`;
    }

    visitFunction(ctx: any): string {
        return `(function ${ctx
            .term()
            .map((t: any) => this.visit(t))
            .join(" ")})`;
    }

    visitUnary(ctx: any): string {
        return `(unary ${ctx.getChild(0).getText()} ${this.visit(ctx.term())})`;
    }

    visitBinary(ctx: any): string {
        return `(binary ${ctx.getChild(1).getText()} ${this.visit(ctx.term(0))} ${this.visit(ctx.term(1))})`;
    }
}

class UnparseVisitor extends DsVisitor {
    visitRule_pool(ctx: any): string {
        return ctx
            .rule_()
            .map((r: any) => this.visit(r))
            .join("\n");
    }

    visitRule(ctx: any): string {
        const result = ctx.term().map((t: any) => this.visit(t));
        const conclusion = result.pop();
        return result.join(", ") + " -> " + conclusion;
    }

    visitSymbol(ctx: any): string {
        return ctx.SYMBOL().getText();
    }

    visitSubscript(ctx: any): string {
        return `${this.visit(ctx.term(0))}[${ctx
            .term()
            .slice(1)
            .map((t: any) => this.visit(t))
            .join(", ")}]`;
    }

    visitFunction(ctx: any): string {
        return `${this.visit(ctx.term(0))}(${ctx
            .term()
            .slice(1)
            .map((t: any) => this.visit(t))
            .join(", ")})`;
    }

    visitUnary(ctx: any): string {
        return `(${ctx.getChild(1).getText()} ${this.visit(ctx.term())})`;
    }

    visitBinary(ctx: any): string {
        return `(${this.visit(ctx.term(0))} ${ctx.getChild(1).getText()} ${this.visit(ctx.term(1))})`;
    }
}

/**
 * Parse Dsp format (human-readable) to Ds format (internal S-expression)
 * @param input - The Dsp format string to parse
 * @returns The Ds format string
 */
export function parse(input: string): string {
    const chars = new InputStream(input);
    const lexer = new DspLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new DspParser(tokens);
    const tree = parser.rule_pool();
    const visitor = new ParseVisitor();
    return visitor.visit(tree);
}

/**
 * Unparse Ds format (internal S-expression) to Dsp format (human-readable)
 * @param input - The Ds format string to unparse
 * @returns The Dsp format string
 */
export function unparse(input: string): string {
    const chars = new InputStream(input);
    const lexer = new DsLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new DsParser(tokens);
    const tree = parser.rule_pool();
    const visitor = new UnparseVisitor();
    return visitor.visit(tree);
}
