---
id: 06169f42-ba48-5a3a-84a5-7150a5319255
slug: arithmetic-sub-add
title: A Subtract Then an Add
difficulty: 2
concepts:
  - arithmetic
  - chaining
  - operand-order
symbol: func_80185a7c
hints:
  - The `subf` runs first and leaves `a - b` in a scratch register.
  - Remember `subf rD, rA, rB` computes `rB - rA`, so `subf r0, r4, r3` is
    `a - b`.
---

# Threading a `subf` into a chain

Now bring the subtract quirk into a chain. Two operations means two arithmetic
instructions, and the first hands its output to the second. Keep an eye on
`r0`: it carries the running result until the last instruction writes `r3`.

Take `blend(p, q, r)`, mixing an add with a subtract:

```asm
add  r0, r3, r4   # r0 = p + q
subf r3, r5, r0   # r3 = r0 - r5  =  (p + q) - r
blr
```

Here's the bit that bites. **`subf rD, rA, rB` computes `rB − rA`**, never
`rA − rB`. Run that through `subf r3, r5, r0` and you get `r0 − r5`, which is
`(p + q) − r`. Get in the habit of flipping the operands every time a `subf`
goes by.

Addition can be regrouped — it's associative. Subtraction can't. So the
compiler keeps your left-to-right C order intact, and the instructions line up
one for one with the operations you wrote. The reversed operands inside `subf`
still mislead.

For this target, two things decide it: which instruction goes first, and which
argument is `rA` and which is `rB` in that `subf`?

## Your task

Write `func_80185a7c` to reproduce the assembly above.

<!-- solution -->
```c
int func_80185a7c(int a, int b, int c) {
    return a - b + c;
}
```
