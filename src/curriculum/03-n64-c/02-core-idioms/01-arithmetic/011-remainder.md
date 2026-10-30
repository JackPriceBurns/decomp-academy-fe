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
  - "After a divide, `mflo` fetches the quotient and `mfhi` fetches the remainder. Which one does the target use?"
  - "The divisor is still the immediate in the `addiu` that starts from `zero`."
---

# The remainder is in HI

The division lesson in the warmup told you that the divide unit computes
*both* results at once: the quotient goes into LO and the remainder into HI.
That lesson only ever fetched LO. Now you will fetch the other half. `mfhi`
("move from HI") gets the remainder. Here's `modFive(x)` returning `x % 5`:

```asm
addiu at, zero, 5    # the divisor, in at as usual
div   zero, a0, at   # LO = x / 5,  HI = x % 5
mfhi  v0             # fetch the REMAINDER this time
nop
nop
jr    ra
nop
```

Compare this with a plain division. The listing is identical except for one
mnemonic: `mflo` has become `mfhi`. Those two letters are the only difference
between `/` and `%` in the output. So when you read a target and see a `div`,
look ahead and check which fetch follows it. That tells you which C operator
you are rebuilding.

One more fact to remember: for signed values, the remainder has the *same
sign as the dividend*. In C, `-7 % 5` is `-2`, and the hardware gives the same
answer, so no correction code is needed. (Divisors that are powers of two are
handled differently, with more complex code. A later lesson covers them.)

## Your task

Write `func_801a1758` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801a1758(s32 a) {
    return a % 7;
}
```
