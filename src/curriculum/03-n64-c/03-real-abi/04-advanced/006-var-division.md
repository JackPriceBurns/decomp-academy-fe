---
id: 445e8514-a536-42ca-a20c-cc5a0d716594
slug: adv-var-division
title: Dividing by a Variable
difficulty: 3
concepts:
  - divide
  - hi-lo
  - traps
  - fingerprints
symbol: func_80117a14
hints:
  - "The checks are the same as in the worked example. The difference is which special register the result comes from."
  - "The target uses `mfhi` where the example uses `mflo`. Which C operator asks for the value that HI holds?"
---

# Division checks that can fire

You have seen `break 0x7` and `break 0x6` before. They guarded a division
whose divisor was a *constant*, so they were dead code that could never run.
When you divide by a **variable**, the same safety checks can fire. Nothing
proves that `b` is not zero, or that `a / b` is not the one case that
overflows. Here is `ratio(a, b)`, which returns `a / b`:

```asm
 0:  div    zero, a0, a1   # LO = a / b … computed before any checking
 4:  mflo   v0
 8:  bnez   a1, 0x14       # divisor nonzero? jump over the trap
 c:  nop
10:  break  0x7            # divide-by-zero trap
14:  addiu  at, zero, -1   # is the divisor −1…
18:  bne    a1, at, 0x2c
1c:  lui    at, 0x8000     #   slot: −2³¹'s upper half, loaded either way
20:  bne    a0, at, 0x2c   # …and the dividend −2³¹?
24:  nop
28:  break  0x6            # overflow trap
2c:  jr     ra
30:  nop
```

Read the order carefully: the `div` runs *first*, and the checks come after
it. The hardware divider does not trap on zero by itself. It only produces a
meaningless result, so the compiler adds `bnez`/`break 0x7` to cause the
crash. Then the pair of `bne`s checks whether this is `−2³¹ ÷ −1`, the one
signed division whose result does not fit, and raises `break 0x6` if it is.
Neither `at` load is conditional. The scheduler builds `0x80000000` in a
delay slot whether or not the second check will use it.

For matching, all of these safety checks come from the single `/` in your C:
both traps, both branches, and where the delay slots are filled. You only
need to notice the shape and write the one-line division. The compiler adds
the checks again on its own.

The target has the same safety checks around the *other* result of the same
hardware operation. One mnemonic is different. Make sure your C asks for the
value that the target fetches.

## Your task

Write `func_80117a14` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80117a14(s32 a, s32 b) {
    return a % b;
}
```
