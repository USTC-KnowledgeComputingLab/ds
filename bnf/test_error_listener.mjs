import { InputStream, CommonTokenStream, ErrorListener, BailErrorStrategy } from "antlr4";
import DspLexer from "./atsds_bnf/DspLexer.js";
import DspParser from "./atsds_bnf/DspParser.js";

// Custom error listener that throws exceptions
class ThrowingErrorListener extends ErrorListener {
    syntaxError(recognizer, offendingSymbol, line, column, msg, e) {
        throw new Error(`line ${line}:${column} ${msg}`);
    }
}

console.log("Test with BailErrorStrategy and custom error listener:");
try {
    const input = "(a + b -> c";
    const chars = new InputStream(input);
    const lexer = new DspLexer(chars);
    const tokens = new CommonTokenStream(lexer);
    const parser = new DspParser(tokens);
    
    // Remove default error listeners
    parser.removeErrorListeners();
    lexer.removeErrorListeners();
    
    // Add our throwing error listener
    parser.addErrorListener(new ThrowingErrorListener());
    lexer.addErrorListener(new ThrowingErrorListener());
    
    // Use BailErrorStrategy to stop parsing on first error
    parser._errHandler = new BailErrorStrategy();
    
    const tree = parser.rule_pool();
    console.log("Parsed successfully (should not reach here)");
} catch (e) {
    console.log("Error caught:", e.message);
}
