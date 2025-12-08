# Examples

This directory contains example files demonstrating the BNF conversion.

## Example Input Files

### example.ds - Lisp-like syntax

```
// Modus ponens rule
(`P -> `Q)
`P
----------
`Q
```

### example.dsp - Traditional syntax

```
// Modus ponens rule
(`P -> `Q), `P -> `Q
```

## Usage Examples

### JavaScript

```javascript
import { unparse, parse } from 'atsds-bnf';
import { readFileSync } from 'fs';

// Read and convert Ds to Dsp
const dsInput = readFileSync('example.ds', 'utf-8');
const dspOutput = unparse(dsInput);
console.log('Ds → Dsp:');
console.log(dspOutput);

// Read and convert Dsp to Ds
const dspInput = readFileSync('example.dsp', 'utf-8');
const dsOutput = parse(dspInput);
console.log('\nDsp → Ds:');
console.log(dsOutput);
```

### Python

```python
from apyds_bnf import unparse, parse

# Read and convert Ds to Dsp
with open('example.ds') as f:
    ds_input = f.read()
dsp_output = unparse(ds_input)
print('Ds → Dsp:')
print(dsp_output)

# Read and convert Dsp to Ds
with open('example.dsp') as f:
    dsp_input = f.read()
ds_output = parse(dsp_input)
print('\nDsp → Ds:')
print(ds_output)
```

### Command-line

```bash
# Using Python CLI
apyds-unparse example.ds
apyds-parse example.dsp
```
