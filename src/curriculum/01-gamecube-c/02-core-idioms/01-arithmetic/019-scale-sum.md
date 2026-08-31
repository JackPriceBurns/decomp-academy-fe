---
id: f1eee226-e397-5123-bc26-e487f5572e50
slug: arithmetic-scale-sum
title: When a Multiply Is a Shift
difficulty: 2
concepts:
  - arithmetic
  - multiplication
  - strength-reduction
  - chaining
symbol: func_8007bb88
hints:
  - "`slwi rD, rA, n` shifts left by `n`, which is the same as multiplying by 2ⁿ
    — so `slwi rX, rX, 3` is `× 8`."
  - The two shifts are independent; each scales one argument before they're
    combined.
---

# When a multiply is a shift

The compiler almost never spends a `mullw` on a power-of-two multiply — it
shifts instead. `slwi rD, rA, n` produces `rA << n`, identical to `rA × 2ⁿ`. So
a shift buried in a chain is just a multiply by some power of two: read the
count, raise two to it, done.

Take `blend(p, q)` — scale two values by different powers of two, then subtract
one from the other:

```asm
slwi r4, r4, 2    # r4 = q << 2  =  q * 4
slwi r0, r3, 3    # r0 = p << 3  =  p * 8
subf r3, r4, r0   # r3 = r0 - r4  =  (p * 8) - (q * 4)
blr
```

Both shifts scale their argument independently, and `subf` ties them off at the
end (`subf rD, rA, rB` is `rB − rA`). The count is the exponent: a shift of 2
is times 4, a shift of 3 is times 8.

Same trick in your target, but the counts change and something other than
`subf` does the combining. Convert each `slwi` count to its multiplier, then
see how the two scaled values come together.

## Your task

Write `func_8007bb88` to reproduce the assembly above.

<!-- solution -->
```c
int func_8007bb88(int a, int b) {
    return a * 4 + b * 2;
}
```
