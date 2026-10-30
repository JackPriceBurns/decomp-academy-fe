---
id: 051b6101-9e75-4feb-8457-193f6628c8d3
slug: arithmetic-divmod-guards
title: "Quotient, Remainder, and the Safety Checks"
difficulty: 3
concepts:
  - arithmetic
  - divide
  - hi-lo
  - fingerprints
symbol: func_80146d84
hints:
  - "There is one `div`, then BOTH fetches. Note which of `mflo`/`mfhi` feeds which side of the final add. You get the guard block below the return value for free."
  - "Everything from `bnez` down comes from the compiler, not from extra C. Write the expression with two terms and nothing more."
---

# Asking for both results

C can use both the quotient *and* the remainder of a division in one
expression. The hardware computes both anyway, so IDO emits a single `div` and
fetches both LO and HI. But other things change too. Here's
`x / 12 + x % 12`:

```asm
 0:  addiu v1, zero, 12   # divisor, in v1 (a real register, not at)
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

Lines 0 to 10 do the real work. The lines after them are IDO's **division
safety checks**. `break` raises a hardware exception, and the branches jump
around it. `bnez` (branch if *not* zero) skips the divide-by-zero trap. Then a
pair of `bne`s (branch if *not* equal) checks for the one signed division that
overflows, −2³¹ ÷ −1. The divisor is the constant 12, so none of these checks
can ever trigger. IDO emits them anyway.

Earlier divisions did not have these checks. When only *one* result is
fetched, IDO uses a shorter special form: the divisor goes in `at`, and there
are no checks. When you ask for both results, it uses the general form
instead: the divisor goes in an ordinary register (here `v1`), with all the
safety checks attached. This dead code appears only because your expression
used `/` and `%` together. It is one of the clearest fingerprints of this
compiler. When you see `break 0x7`, write the simple expression that produces
it.

## Your task

Write `func_80146d84` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80146d84(s32 a) {
    return a / 9 + a % 9;
}
```
