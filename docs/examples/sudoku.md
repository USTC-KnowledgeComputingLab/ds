# Sudoku

This example demonstrates a **Sudoku Solver** powered by the DS deductive system. The solver uses logical rules to deduce cell values based on standard Sudoku constraints:

- **Row constraint**: Each row must contain the digits 1-9 exactly once
- **Column constraint**: Each column must contain the digits 1-9 exactly once
- **Box constraint**: Each 3×3 box must contain the digits 1-9 exactly once

## How It Works

The Sudoku solver encodes Sudoku rules as logical inference rules in the DS system. When you click "Solve", the search engine iteratively applies these rules to deduce new cell values until the puzzle is complete. You can also click "Update" to perform a single iteration of inference and observe the step-by-step solving process in the log.

## Interactive Demo

<script setup>
import Sudoku from './Sudoku.vue'
</script>

<ClientOnly>
  <Sudoku />
</ClientOnly>