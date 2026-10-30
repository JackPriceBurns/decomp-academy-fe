---
id: 26284471-9ed2-46bd-864f-b24ee84b30eb
slug: arithmetic-add-sub-chain
title: Chains of Adds and Subtracts
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: func_8018a110
hints:
  - "Decode each line into \"so far = …\", as in the worked example. The first instruction combines two arguments, and the second combines that result with the third."
  - "One line is an `addu` and one is a `subu`. The mnemonics tell you which C operator goes between each pair of variables."
---

# Reading a two-step expression

An expression with three variables compiles to two instructions. They are
evaluated from left to right, and the running total passes through `t6`, the
first temporary from the last lesson. Here's `spread(p, q, r)` returning
`p - q - r`:

```asm
subu t6, a0, a1    # t6 = p - q
subu v0, t6, a2    # v0 = (p - q) - r
jr   ra
nop
```

You will use this decoding method for the rest of the course, so it helps to
give it a name: **track what each register holds, line by line**. After line
one, `t6` holds "p minus q". Line two subtracts `a2` from *that*. This is the
last value the function computes, so the result goes straight into `v0`. Put
the steps back together and you have the C.

Check two things on every line as you go:

- **The mnemonic** (`addu` or `subu`) is the operator between the terms.
- **The operand order** matters for `subu`: the value on the left of the minus
  is always the middle operand.

The target below mixes the two instructions. Decode it the same way.

## Your task

Write `func_8018a110` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8018a110(s32 a, s32 b, s32 c) {
    return a + b - c;
}
```
