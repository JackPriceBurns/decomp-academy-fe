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
  - "Decode each line into \"so far = …\" like the worked example — the first instruction combines two arguments, the second folds in the third."
  - "One line is an `addu` and one is a `subu`; the mnemonics tell you which C operator sits between each pair of variables."
---

# Reading a two-step expression

An expression with three variables compiles to two instructions, evaluated left
to right, with the running total flowing through that first temporary you just
met. Here's `spread(p, q, r)` returning `p - q - r`:

```asm
subu t6, a0, a1    # t6 = p - q
subu v0, t6, a2    # v0 = (p - q) - r
jr   ra
nop
```

The decode routine is the one you'll use for the rest of this course, so let's
name it: **track what each register holds, line by line**. After line one, `t6`
is "p minus q". Line two subtracts `a2` from *that*, and because the result is
the last thing the function computes, it lands directly in `v0`. Reassemble the
story and the C falls out.

Two things to check on every line as you go:

- **The mnemonic** — `addu` or `subu` — is the operator between the terms.
- **The operand order** — for `subu`, what's on the left of the minus is the
  middle operand, always.

The target below mixes the two instructions. Same decode, different story.

## Your task

Write `func_8018a110` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8018a110(s32 a, s32 b, s32 c) {
    return a + b - c;
}
```
