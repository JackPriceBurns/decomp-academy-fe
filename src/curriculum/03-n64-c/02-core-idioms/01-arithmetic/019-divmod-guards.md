---
id: 051b6101-9e75-4feb-8457-193f6628c8d3
slug: arithmetic-divmod-guards
title: "Quotient, Remainder, and the Safety Net"
difficulty: 3
concepts:
  - arithmetic
  - divide
  - hi-lo
  - fingerprints
symbol: func_80146d84
hints:
  - "One `div`, then BOTH fetches — note which of `mflo`/`mfhi` feeds which side of the final add. The guard block below the return is free."
  - "Everything from `bnez` down comes from the compiler, not from extra C. Write the two-term expression and stop."
---

# Ask for both, get the whole ritual

C can use a division's quotient *and* remainder in one expression, and the
hardware computed both anyway — so IDO issues a single `div` and fetches LO
and HI. But watch what else changes. Here's `x / 12 + x % 12`:

```asm
 0:  addiu v1, zero, 12   # divisor — in v1, a real register, not at
 4:  div   zero, a0, v1   # LO = x / 12,  HI = x % 12
 8:  mfhi  t7             # the remainder…
 c:  mflo  t6             # …and the quotient
10:  addu  v0, t6, t7     # their sum
14:  bnez  v1, 0x20       # divisor nonzero? skip the trap
18:  nop
1c:  break 0x7            # divide-by-zero trap
20:  addiu at, zero, -1   # is the divisor -1…
24:  bne   v1, at, 0x38
28:  lui   at, 0x8000     # (delay slot) …and the dividend -2^31?
2c:  bne   a0, at, 0x38
30:  nop
34:  break 0x6            # overflow trap
38:  jr    ra
3c:  nop
```

Lines 0–10 are honest work. Everything after is IDO's **division safety net**:
`break` raises a hardware exception, and the branches steer around it —
`bnez` (branch if *not* zero) skips the divide-by-zero trap, then a pair of
`bne`s (branch if *not* equal) checks for the one overflowing signed division,
−2³¹ ÷ −1. The divisor is a constant 12; none of this can ever fire. IDO
emits it anyway.

Why didn't earlier divisions have this? When only *one* result was fetched,
IDO used its tidy special path — divisor in `at`, no checks. Ask for both
results and it falls back to the general path: divisor in an ordinary register
(here `v1`), full safety net attached. Dead code, faithfully reproduced, purely
because your expression mentioned `/` and `%` together — one of the loudest
fingerprints in this whole compiler. Spot the `break 0x7`, smile, and write
the simple expression that summons it.

## Your task

Write `func_80146d84` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80146d84(s32 a) {
    return a / 9 + a % 9;
}
```
