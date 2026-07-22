---
id: b4a2a869-0e9d-5bb6-9592-7561e2d63043
slug: int64-multiply
title: Multiplying 64-bit Integers
difficulty: 2
concepts:
  - 64-bit
  - arithmetic
  - multiply
symbol: mul_64
hints:
  - A 64-bit product expands inline into a recognizable burst of mullw/mulhwu plus adds.
  - "One `mulhwu` (high half of low×low) and three `mullw`s, summed together — that whole block is one `a * b`."
  - The whole burst is one ordinary single-operator combination of the two parameters; the compiler expands it for you.
---

# The multiply burst

Now and then you'll hit a function that fires off three or four multiplies back
to back on the same register pairs. That isn't several multiplies. It's one
64-bit multiply expanded inline, because only the low 64 bits of the product are
kept, and producing them takes three partial products plus the high half of one:

```asm
mulhwu r7, r4, r6     # high 32 bits of (a_lo * b_lo)
mullw  r3, r3, r6     # a_hi * b_lo
mullw  r0, r4, r5     # a_lo * b_hi
add    r3, r7, r3
mullw  r4, r4, r6     # a_lo * b_lo  -> result low word
add    r3, r3, r0     # result high word
blr
```

Walk through it. `mulhwu r7, r4, r6` takes the top 32 bits of `a_lo * b_lo`, the
carry that has to climb into the high word. The three `mullw`s handle
`a_hi * b_lo`, `a_lo * b_hi`, and `a_lo * b_lo` itself, and the two `add`s fold
everything into `r3:r4`. The `mulhwu` is what gives it away; 32-bit code never
wants the high half of a 32×32 product.

Truncation hides all of it. Return a `u32` and the burst shrinks to one `mullw`,
no different from an ordinary 32-bit multiply. A clipped add still leaves its
carry on show, but a clipped multiply gives you nothing to spot.

## Your task

Write `mul_64` to match the target.

<!-- solution -->
```c
u64 mul_64(u64 a, u64 b) {
    return a * b;
}
```
