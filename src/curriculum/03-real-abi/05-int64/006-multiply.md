---
id: int64-multiply
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
  - Just write `a * b` on two `u64` parameters.
---

# The multiply burst

Unlike division, a 64-bit multiply is done **inline** — but it expands into a
distinctive cluster of instructions. Only the low 64 bits of the product matter,
which works out to three partial products plus the high-half of one of them:

```asm
mulhwu r7, r4, r6     # high 32 bits of (a_lo * b_lo)
mullw  r3, r3, r6     # a_hi * b_lo
mullw  r0, r4, r5     # a_lo * b_hi
add    r3, r7, r3
mullw  r4, r4, r6     # a_lo * b_lo  -> result low word
add    r3, r3, r0     # result high word
blr
```

The key player is **`mulhwu`** ("multiply high word unsigned"), which gives the
*upper* 32 bits of a 32×32 product — the bits that would otherwise be lost and
need to be carried into the high word. Seeing `mulhwu` next to a few `mullw`s,
all feeding into the same register pair, is the signature of a 64-bit multiply.

Note the asymmetry with downcasting: a `u32 = u64 * u64` downcast collapses to a
**single `mullw`**, indistinguishable from an ordinary 32-bit multiply — so unlike
addition, multiplication leaves *no* fingerprint once the result is truncated.
The full burst above only appears when the result is genuinely 64-bit wide.

## Your task

Write `mul_64` to match the target.

<!-- starter -->
```c
u64 mul_64(u64 a, u64 b) {
    return 0;
}
```

<!-- solution -->
```c
u64 mul_64(u64 a, u64 b) {
    return a * b;
}
```
