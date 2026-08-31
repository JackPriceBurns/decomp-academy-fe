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
  - "Same guard skeleton as the worked example — the difference is which special register the result comes from."
  - "`mfhi`, not `mflo`. Which C operator asks for what HI holds?"
---

# The safety net, armed

You've met `break 0x7` and `break 0x6` before, guarding a division whose
divisor was a *constant* — dead code that could never fire. Divide by a
**variable** and the same net goes live: nothing proves `b` isn't zero, or
that `a / b` isn't the one overflowing case. Here's `ratio(a, b)`, returning
`a / b`:

```asm
 0:  div    zero, a0, a1   # LO = a / b … computed before any checking
 4:  mflo   v0
 8:  bnez   a1, 0x14       # divisor nonzero? hop over the trap
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

Read the order carefully: the `div` executes *first*, checks after. The
hardware divider doesn't trap on zero by itself — it just produces garbage —
so the compiler's `bnez`/`break 0x7` supplies the crash. Then the pair of
`bne`s asks whether this is `−2³¹ ÷ −1` (the one signed division whose result
doesn't fit) and raises `break 0x6` if so. Neither `at` load is conditional;
the scheduler happily builds `0x80000000` in a delay slot whether or not the
second check will use it.

For matching, the entire net — both traps, both branches, the slot placement
— comes from the single `/` in your C. Your job is only to notice the shape,
write the one-line division, and let the compiler rebuild its paranoia.

The target uses the same net around the *other* result of the same hardware
operation. One mnemonic differs. Make sure your C asks for what it fetches.

## Your task

Write `func_80117a14` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80117a14(s32 a, s32 b) {
    return a % b;
}
```
