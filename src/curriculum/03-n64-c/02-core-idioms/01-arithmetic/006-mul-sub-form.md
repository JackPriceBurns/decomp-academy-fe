---
id: 2e56f7be-d2f0-4936-9bef-80b5571468f9
slug: arithmetic-mul-sub-form
title: "Shift Chains: The Subtract Form"
difficulty: 2
concepts:
  - arithmetic
  - strength-reduction
  - shifts
symbol: func_80395bdc
hints:
  - "`sll` by k then `subu` of the original input computes (2^k - 1) times the
    input."
  - "The shift amount in the target is bigger than the example's — the algebra is the same, only the power of two changes."
---

# 2^k minus one

The mirror-image family: constants one *below* a power of two. Overshoot with
the shift, then subtract one copy of the input to land exactly. Here's ×7:

```asm
sll  v0, a0, 3     # v0 = x * 8
subu v0, v0, a0    # v0 = x*8 - x  =  x * 7
jr   ra
nop
```

Shift by 3 overshoots to ×8; the `subu` pulls it back to ×7. So the pattern
`sll` by `k` + `subu` of the original argument reads as "2^k − 1 times the
input": shift 3 is ×7, shift 5 is ×31.

Between this lesson and the last you now hold both halves of a decision the
compiler makes constantly: for any constant near a power of two, it picks
whichever direction is closer — *undershoot and add* or *overshoot and
subtract*. When you're decoding, you don't need to guess which it chose; the
mnemonic on the second line tells you. `addu` means plus one copy, `subu`
means minus one.

## Your task

Write `func_80395bdc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80395bdc(s32 x) {
    return x * 15;
}
```
