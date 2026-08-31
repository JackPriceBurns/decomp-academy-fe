---
id: 03f76a99-1766-48f1-aa2a-e1d59d2b8fda
slug: foundations-div-const
title: Dividing by a Constant
difficulty: 1
concepts:
  - arithmetic
  - divide
  - hi-lo
symbol: divConst
hints:
  - "The `addiu at, zero, N` builds the divisor; `div` + `mflo` is signed division keeping the quotient."
  - "Don't try to write the nops — a one-line division in C produces every instruction here, nops included."
---

# Division goes through HI and LO

Division has no immediate form at all, so the first thing the compiler must do
is load the divisor into a register — the familiar `addiu`-from-`zero` — and
the register it picks is `at`, the assembler temporary you met in the register
tour, doing exactly the scratch work it exists for.

Then comes the strange part. `div` doesn't write its result to a normal
register. The divide unit deposits results into a special pair called **HI and
LO**: the quotient lands in LO, the remainder in HI. A separate instruction —
`mflo`, "move from LO" — fetches the quotient out. Here's the whole ritual for a
divide by 6:

```asm
addiu  at, zero, 6    # the divisor, parked in the scratch register
div    zero, a0, at   # LO = a0 / 6   (HI gets the remainder)
mflo   v0             # fetch the quotient into v0
nop                   # the divider is slow —
nop                   #   the compiler spaces it out
jr     ra
nop
```

Two things to absorb:

- That `zero` in the `div` operands is just how the three-operand form is
  printed — the actual results go to HI/LO, not to a register you name.
- The two `nop`s are **real and required**. The hardware divider takes many
  cycles, and IDO conservatively pads after `mflo`. They come from the compiler,
  not from anything you write — your one-line C produces them automatically.
  This is your first taste of a theme that dominates N64 matching: the compiler
  leaves fingerprints, and matching means reproducing those too.

Read the divisor straight off the target's `addiu`-from-`zero` line, and you
have the whole function.

## Your task

Write `divConst`, taking an `s32 a`, to reproduce the division sequence in the
target assembly.

<!-- starter -->
```c
s32 divConst(s32 a) {
    return 0;
}
```

<!-- solution -->
```c
s32 divConst(s32 a) {
    return a / 3;
}
```
