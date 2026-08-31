---
id: 7a1d8840-fa11-4306-b5ff-8fd6922efd40
slug: bitwise-variable-shifts
title: Shifting by a Variable
difficulty: 2
concepts:
  - shifts
  - registers
  - types
symbol: func_80287620
hints:
  - "In the `v` forms the amount is the LAST operand and the value shifted is the middle one — mirror of nothing you've seen, so read carefully."
  - "The mnemonic still runs the type oracle from last lesson; `srlv` vs `srav` tells you how to declare the shifted value."
---

# sllv, srlv, srav

Every shift so far had its amount baked into the instruction. When the amount
is itself a variable, each shift has a **v**-suffixed register form: `sllv`,
`srlv`, `srav`. Here's a value shifted left by however much its second
argument says:

```asm
sllv v0, a0, a1    # v0 = x << n — value in a0, amount in a1
jr   ra
nop
```

The operand order deserves a hard look: **destination, value, amount** — the
shift amount rides in the *last* slot. With two argument registers side by
side in one instruction, swapping them produces `n << x`, which compiles just
as happily and matches nothing. Same discipline as `subu`: say it out loud —
"`a0` shifted by `a1`" — before you write the C.

(The hardware only reads the bottom 5 bits of the amount register — a shift
by 33 behaves as a shift by 1. C calls shifting past the width undefined, so
the compiler simply doesn't care what happens there, and neither will any
code you decompile.)

Everything else transfers wholesale from the constant forms, including the
type oracle: `srlv` means the shifted value is unsigned, `srav` means signed.
The target below shifts right — check the mnemonic, declare accordingly, and
keep the operands straight.

## Your task

Write `func_80287620` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_80287620(u32 x, s32 n) {
    return x >> n;
}
```
