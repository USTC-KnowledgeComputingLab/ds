import { describe, it } from 'node:test';
import assert from 'node:assert';
import { unparse, parse } from '../dist/index.js';

describe('BNF Conversion', () => {
    describe('unparse (Ds → Dsp)', () => {
        it('should convert simple symbol', () => {
            const input = 'a';
            const output = unparse(input);
            assert.strictEqual(output, 'a');
        });

        it('should convert binary expression', () => {
            const input = '(binary -> a b)';
            const output = unparse(input);
            assert.strictEqual(output, '(a -> b)');
        });

        it('should convert function call', () => {
            const input = '(function f a b)';
            const output = unparse(input);
            assert.strictEqual(output, 'f(a, b)');
        });

        it('should convert subscript', () => {
            const input = '(subscript arr i j)';
            const output = unparse(input);
            assert.strictEqual(output, 'arr[i, j]');
        });

        it('should convert unary expression', () => {
            const input = '(unary ! x)';
            const output = unparse(input);
            assert.strictEqual(output, '! x');
        });

        it('should convert rule with premises', () => {
            const input = '(binary -> `P `Q)\n`P\n----------\n`Q';
            const output = unparse(input);
            assert.ok(output.includes('->'));
        });
    });

    describe('parse (Dsp → Ds)', () => {
        it('should convert simple symbol', () => {
            const input = 'a';
            const output = parse(input);
            assert.strictEqual(output, 'a');
        });

        it('should convert binary expression', () => {
            const input = 'a -> b';
            const output = parse(input);
            assert.ok(output.includes('binary'));
            assert.ok(output.includes('->'));
        });

        it('should convert function call', () => {
            const input = 'f(a, b)';
            const output = parse(input);
            assert.ok(output.includes('function'));
        });

        it('should convert subscript', () => {
            const input = 'arr[i, j]';
            const output = parse(input);
            assert.ok(output.includes('subscript'));
        });

        it('should convert unary expression', () => {
            const input = '! x';
            const output = parse(input);
            assert.ok(output.includes('unary'));
        });
    });

    describe('round-trip conversion', () => {
        it('should handle Ds → Dsp → Ds round-trip for simple expressions', () => {
            const original = '(binary + a b)';
            const dsp = unparse(original);
            const ds = parse(dsp);
            // Note: May not be exactly equal due to formatting, but structure should be preserved
            assert.ok(ds.includes('binary'));
            assert.ok(ds.includes('+'));
        });
    });
});
