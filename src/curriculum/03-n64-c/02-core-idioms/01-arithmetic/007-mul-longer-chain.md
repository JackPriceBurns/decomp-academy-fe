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
  - "Decode the first two lines as a (2^k ± 1) pair, then let the final `sll` multiply that result by its own power of two."
  - "Multiply the factors of every line together — one clean constant comes out, and that's the whole C function."
---

# Factoring the constant

What about constants that aren't near a power of two at all? IDO *factors*
them. If the constant is (something it knows how to build) × (a power of two),
it builds the something, then shifts the whole result. Here's ×10, built as
5 × 2:

```asm
sll  v0, a0, 2     # v0 = x * 4
addu v0, v0, a0    # v0 = x * 5
sll  v0, v0, 1     # v0 = x*5 * 2  =  x * 10
jr   ra
nop
```

Lines one and two are last lesson's ×5 pattern, unchanged. Line three shifts
the *result* — not the original argument — doubling everything built so far.

That distinction is the whole skill of reading long chains. An `sll` whose
source is the original argument register starts a fresh "2^k times x" term. An
`sll` whose source is the running result multiplies *everything so far* by a
power of two. Track which one you're looking at, keep a running multiplier in
the margin, and any chain decodes mechanically:

- `sll` from the argument: start at 2^k.
- `addu`/`subu` with the argument: ±1.
- `sll` from the result: multiply the running total by 2^k.

The target chain below has the same three-instruction shape with different
amounts. Run your margin math all the way to the bottom.

## Your task

Write `func_8024f390` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8024f390(s32 x) {
    return x * 36;
}
```
