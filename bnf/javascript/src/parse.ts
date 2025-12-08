import antlr4 from 'antlr4';
import DspLexer from './generated/DspLexer.js';
import DspParser from './generated/DspParser.js';
import DspVisitor from './generated/DspVisitor.js';

/**
 * Visitor to convert from traditional Dsp syntax to lisp-like Ds syntax
 */
class ParseVisitor extends DspVisitor {
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
        
        // Check if this is a rule with arrow (->)
        const text = ctx.getText();
        if (text.includes('->')) {
            // Multiple premises with conclusion
            const conclusion = result.pop();
            return result.join('\n') + '\n----------\n' + conclusion;
        } else {
            // Just a fact (single term)
            return result[0];
        }
    }

    visitSymbol(ctx) {
        return ctx.SYMBOL().getText();
    }

    visitParentheses(ctx) {
        return this.visit(ctx.term(0));
    }

    visitSubscript(ctx) {
        const terms = ctx.term();
        const base = this.visit(terms[0]);
        const indices = terms.slice(1).map(t => this.visit(t));
        return `(subscript ${base} ${indices.join(' ')})`;
    }

    visitFunction(ctx) {
        const terms = ctx.term();
        const func = this.visit(terms[0]);
        const args = terms.slice(1).map(t => this.visit(t));
        
        if (args.length === 0) {
            return `(function ${func})`;
        }
        return `(function ${func} ${args.join(' ')})`;
    }

    visitUnary(ctx) {
        const op = ctx.getChild(0).getText();
        const operand = this.visit(ctx.term(0));
        return `(unary ${op} ${operand})`;
    }

    visitBinary(ctx) {
        const terms = ctx.term();
        const left = this.visit(terms[0]);
        const right = this.visit(terms[1]);
        
        // Find the operator - it's the token between the two terms
        // Iterate through children to find terminal nodes (operators)
        let op = '';
        for (let i = 0; i < ctx.getChildCount(); i++) {
            const child = ctx.getChild(i);
            // Check if this is a terminal node (not a term context)
            if (!child.term && child.symbol) {
                op = child.getText();
                break;
            } else if (typeof child.getText === 'function') {
                const text = child.getText();
                // Skip if it matches term outputs
                if (text !== left && text !== right && !text.includes('(') && text.length > 0) {
                    op = text;
                    break;
                }
            }
        }
        
        return `(binary ${op} ${left} ${right})`;
    }
}

/**
 * Convert from traditional Dsp syntax to lisp-like Ds syntax
 * @param {string} input - Input text in Dsp syntax
 * @returns {string} Output text in Ds syntax
 */
export function parse(input) {
    const chars = new antlr4.CharStream(input);
    const lexer = new DspLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new DspParser(tokens);
    const tree = parser.rule_pool();
    const visitor = new ParseVisitor();
    return visitor.visit(tree);
}
