# Grammar Design Notes

## ANTLR Grammar Files

This directory contains the ANTLR4 grammar files for the DS syntax formats. These grammars are based on the specifications provided in the original issue.

### Ds.g4 - Lisp-like Syntax

This grammar defines the current lisp-like syntax used in DS:

- **Rules**: Premises and conclusion separated by `----------` (RULE token)
- **Terms**: All operations are prefix notation with explicit type markers
  - `(subscript base index1 index2)`
  - `(function name arg1 arg2)`
  - `(unary op operand)`
  - `(binary op left right)`

### Dsp.g4 - Traditional Syntax

This grammar defines a more traditional syntax with infix operators:

- **Rules**: Premises separated by commas, `->` before conclusion
- **Terms**: Standard infix notation with operator precedence
  - Subscript: `base[index1, index2]`
  - Function: `name(arg1, arg2)`
  - Unary: `op operand`
  - Binary: `left op right` with full precedence hierarchy

## Known Design Trade-offs

### Rule Ambiguity (Dsp.g4, line 9)

The rule grammar allows both:
```
term                    // A simple fact
(term, term)* -> term   // A rule with premises
```

This design choice matches the specification from the issue. While it could be made less ambiguous by requiring at least one premise when using the arrow syntax, the current design allows for flexibility in rule definition.

### SYMBOL Token Definition (Both grammars, line 47)

The SYMBOL token is defined as `~[ \t\r\n,()]+` which is intentionally permissive to allow a wide variety of symbols including operators in certain contexts. This matches the specification and allows symbols to contain characters like `->`, `P`, `Q`, etc.

The lexer resolves potential ambiguities through:
1. Maximal munch rule (longer tokens win)
2. Token definition order (specific operators before SYMBOL)
3. Keyword tokens taking precedence

This design was chosen to maintain compatibility with the DS system's existing symbol naming conventions.

## Future Improvements

If these grammars need to be made more robust:

1. **Make premises mandatory in arrow rules**: Change line 9 to require at least one premise
2. **Restrict SYMBOL token**: Exclude operator characters from symbol definition
3. **Add explicit keywords**: Make `->`  a keyword token rather than relying on character matching

However, any such changes should be coordinated with the DS core syntax to ensure compatibility.
