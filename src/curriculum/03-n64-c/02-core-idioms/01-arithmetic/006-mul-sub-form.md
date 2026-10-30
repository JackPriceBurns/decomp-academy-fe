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
  - "`sll` by k, then `subu` of the original input, computes (2^k − 1) times the input."
  - "The shift amount in the target is bigger than in the example. The algebra is the same. Only the power of two changes."
---

# 2^k minus one

This is the opposite group: constants one *below* a power of two. The compiler
shifts too far, then subtracts one copy of the input to reach the exact value.
Here's ×7:

```asm
sll  v0, a0, 3     # v0 = x * 8
subu v0, v0, a0    # v0 = x*8 - x  =  x * 7
jr   ra
nop
```

Shifting by 3 goes past the value to ×8, and the `subu` brings it back to ×7.
So `sll` by `k` followed by `subu` of the original argument means "2^k − 1
times the input". Shift 3 is ×7, and shift 5 is ×31.

With this lesson and the last one, you now know both options the compiler
chooses between all the time. For a constant near a power of two, it picks
whichever direction is closer: *shift too little and add*, or *shift too far
and subtract*. When you decode, you don't need to guess which one it chose.
The mnemonic on the second line tells you: `addu` means plus one copy, and
`subu` means minus one.

## Your task

Write `func_80395bdc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80395bdc(s32 x) {
    return x * 15;
}
```
