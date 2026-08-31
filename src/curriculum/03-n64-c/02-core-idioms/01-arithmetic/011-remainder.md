---
id: a685d662-e6ed-48a0-90bf-95b9f525fdac
slug: arithmetic-remainder
title: "mfhi: The Other Half of Division"
difficulty: 2
concepts:
  - arithmetic
  - divide
  - hi-lo
symbol: func_801a1758
hints:
  - "`mflo` after a divide fetches the quotient; `mfhi` fetches the remainder.
    Which one does the target use?"
  - "The divisor still sits in plain sight on the `addiu`-from-`zero` line."
---

# The remainder was there all along

Warmup's division lesson told you the divide unit computes *both* results at
once — quotient into LO, remainder into HI — and then only ever fetched LO.
Time to collect the other half. `mfhi`, "move from HI", pulls out the
remainder. Here's `modFive(x)` returning `x % 5`:

```asm
addiu at, zero, 5    # the divisor, parked in at as usual
div   zero, a0, at   # LO = x / 5,  HI = x % 5
mfhi  v0             # fetch the REMAINDER this time
nop
nop
jr    ra
nop
```

Compare with a plain division and the listing is identical except for one
mnemonic: `mflo` became `mfhi`. That single letter pair is the entire
difference between `/` and `%` in the output — so when you're skimming a
target, the moment you see a `div`, jump ahead and check which fetch follows.
It tells you which C operator you're reconstructing.

One property to file away: for signed values, the remainder takes the *sign of
the dividend* — `-7 % 5` is `-2` in C, and the hardware agrees, so no
correction code is needed. (Divisors that are powers of two get cleverer and
messier treatment; that's a lesson of its own shortly.)

## Your task

Write `func_801a1758` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801a1758(s32 a) {
    return a % 7;
}
```
