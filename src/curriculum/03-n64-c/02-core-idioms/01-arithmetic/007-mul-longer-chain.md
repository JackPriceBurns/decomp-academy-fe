---
id: 393ce4ae-ac3d-4110-8f3f-5bf635d82e1d
slug: arithmetic-mul-longer-chain
title: Chains That Keep Going
difficulty: 2
concepts:
  - arithmetic
  - strength-reduction
  - shifts
symbol: func_8024f390
hints:
  - "Decode the first two lines as a (2^k ± 1) pair. Then the final `sll` multiplies that result by its own power of two."
  - "Multiply the factors from every line together. You get one constant, and multiplying by it is the whole C function."
---

# Factoring the constant

Some constants are not near a power of two at all. IDO *factors* these. If the
constant is (something it knows how to build) × (a power of two), it builds
the first part, then shifts the whole result. Here's ×10, built as 5 × 2:

```asm
sll  v0, a0, 2     # v0 = x * 4
addu v0, v0, a0    # v0 = x * 5
sll  v0, v0, 1     # v0 = x*5 * 2  =  x * 10
jr   ra
nop
```

Lines one and two are the ×5 pattern you have already seen, unchanged. Line
three shifts the *result* instead of the original argument. This doubles
everything built so far.

This difference is the key skill for reading long chains. An `sll` whose
source is the original argument register starts a new "2^k times x" term. An
`sll` whose source is the running result multiplies *everything so far* by a
power of two. Note which kind each one is, and write down a running multiplier
as you go. Then any chain decodes step by step:

- `sll` from the argument: start at 2^k.
- `addu`/`subu` with the argument: ±1.
- `sll` from the result: multiply the running total by 2^k.

The target below has the same three instructions with different amounts. Keep
the running multiplier going all the way to the last line.

## Your task

Write `func_8024f390` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8024f390(s32 x) {
    return x * 36;
}
```
