import antlr4 from 'antlr4';
import DsLexer from './generated/DsLexer.js';
import DsParser from './generated/DsParser.js';
import DsVisitor from './generated/DsVisitor.js';

/**
 * Visitor to convert from lisp-like Ds syntax to traditional Dsp syntax
 */
class UnparseVisitor extends DsVisitor {
    visitRule_pool(ctx) {
        const rules = ctx.rule_();
        if (!rules || rules.length === 0) {
            return '';
        }
        return rules.map(r => this.visit(r)).join('\n');
    }

    visitRule(ctx) {
        const terms = ctx.term();
        if (!terms || terms.length === 0) {
            return '';
        }
        
        const result = terms.map(t => this.visit(t));
        const conclusion = result.pop();
        
        if (result.length === 0) {
            return conclusion;
        }
        
        return result.join(', ') + ' -> ' + conclusion;
    }

    visitSymbol(ctx) {
        return ctx.SYMBOL().getText();
    }

    visitSubscript(ctx) {
        const terms = ctx.term();
        if (!terms || terms.length === 0) {
            return '';
        }
        
        const base = this.visit(terms[0]);
        const indices = terms.slice(1).map(t => this.visit(t)).join(', ');
        return `${base}[${indices}]`;
    }

    visitFunction(ctx) {
        const terms = ctx.term();
        if (!terms || terms.length === 0) {
            return '';
        }
        
        const func = this.visit(terms[0]);
        const args = terms.slice(1).map(t => this.visit(t)).join(', ');
        return `${func}(${args})`;
    }

    visitUnary(ctx) {
        const op = ctx.SYMBOL().getText();
        const operand = this.visit(ctx.term(0));
        return `${op} ${operand}`;
    }

    visitBinary(ctx) {
        const op = ctx.SYMBOL().getText();
        const left = this.visit(ctx.term(0));
        const right = this.visit(ctx.term(1));
        return `(${left} ${op} ${right})`;
    }
}

/**
 * Convert from lisp-like Ds syntax to traditional Dsp syntax
 * @param {string} input - Input text in Ds syntax
 * @returns {string} Output text in Dsp syntax
 */
export function unparse(input) {
    const chars = new antlr4.CharStream(input);
    const lexer = new DsLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new DsParser(tokens);
    const tree = parser.rule_pool();
    const visitor = new UnparseVisitor();
    return visitor.visit(tree);
}
