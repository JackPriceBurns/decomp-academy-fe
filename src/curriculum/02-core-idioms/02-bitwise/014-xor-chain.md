---
id: bitwise-xor-chain
title: Chaining XOR Across Three Values
difficulty: 2
concepts:
  - bitwise
  - xor
  - chaining
symbol: xor_chain
hints:
  - "`xor rD, rA, rB` writes `rA ^ rB` into `rD`."
  - Each `xor` has two inputs — trace which register carries the intermediate
    result from the first into the second.
---

# XOR is left-associative in hardware too

`xor` has no accumulator register; it always takes exactly two operands. When
you chain three or more XOR operands in C, the compiler breaks it into a
sequence where each instruction folds in one more value.

Consider `xor_four(a, b, c, d)`, which XORs four values together:

```asm
xor     r0,r3,r4
xor     r0,r5,r0
xor     r3,r6,r0
blr
```

- `xor r0, r3, r4` computes `a ^ b` and stores it in `r0`.
- `xor r0, r5, r0` computes `c ^ r0` — that is, `c ^ (a ^ b)`.
- `xor r3, r6, r0` computes `d ^ r0` — that is, `d ^ (c ^ (a ^ b))`.

`r3` ends up holding `a ^ b ^ c ^ d`. Each step feeds its result into the next
as one of the two source operands. The intermediate value lives in `r0` until
the last XOR writes the final result into `r3` for the return.

The target assembly is shorter — one fewer `xor`. Count the `xor` instructions
to determine how many values are being combined, then trace the registers to work
out the argument order.

## Your task

Write `xor_chain`, taking three `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int xor_chain(int a, int b, int c) {
    return 0;
}
```

<!-- solution -->
```c
int xor_chain(int a, int b, int c) {
    return a ^ b ^ c;
}
```
