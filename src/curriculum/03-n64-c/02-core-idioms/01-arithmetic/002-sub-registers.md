---
id: a15960e1-7b1d-4b03-b747-2218bcab55d8
slug: arithmetic-sub-registers
title: Subtraction and Operand Order
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: func_80056580
hints:
  - "`subu rd, rs, rt` computes rs - rt — the middle operand is the one being
    subtracted *from*."
  - "Check which argument register appears second and which third in the target's `subu`, then write the C in that order."
---

# subu, and why order suddenly matters

Register subtraction is `subu rd, rs, rt` — and unlike addition, you can't be
sloppy about which operand is which. `subu` computes `rs - rt`: the *second*
operand minus the *third*.

Here's a function that returns its **second** argument minus its first —
`revDiff(x, y)` returning `y - x`:

```asm
subu v0, a1, a0    # v0 = a1 - a0, i.e. y - x
jr   ra
nop
```

Note the operands: `a1` before `a0`. Swap them and you'd have a different
function — same instruction, same registers, opposite sign. A one-line `subu`
is one of the easiest places in MIPS to write plausible-looking C that's
backwards, and the diff will happily show you two identical mnemonics with the
operands crossed.

So make it a reflex: every time you meet a `subu`, say the subtraction out loud
— "*this* minus *that*" — mapping each register back to the argument it
carries. `a0` is the first argument, `a1` the second.

The target below is the same single instruction with its own operand order. Read
it carefully before you write anything.

## Your task

Write `func_80056580` to reproduce the target `subu`.

<!-- solution -->
```c
s32 func_80056580(s32 a, s32 b) {
    return a - b;
}
```
