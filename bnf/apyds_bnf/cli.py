"""
Command-line interface for ds-bnf
"""

import sys
from .unparse import unparse
from .parse import parse


def unparse_cli():
    """CLI entry point for unparsing Ds to Dsp"""
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r") as f:
            input_text = f.read()
    else:
        input_text = sys.stdin.read()

    result = unparse(input_text)
    print(result)


def parse_cli():
    """CLI entry point for parsing Dsp to Ds"""
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r") as f:
            input_text = f.read()
    else:
        input_text = sys.stdin.read()

    result = parse(input_text)
    print(result)


if __name__ == "__main__":
    if "unparse" in sys.argv[0]:
        unparse_cli()
    else:
        parse_cli()
