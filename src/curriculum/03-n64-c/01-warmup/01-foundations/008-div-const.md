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
  - "The `addiu at, zero, N` builds the divisor. `div` followed by `mflo` is a signed division that keeps the quotient."
  - "Don't try to write the nops. A one-line division in C produces every instruction here, including the nops."
---

# Division goes through HI and LO

Division has no immediate form, so the compiler first has to load the divisor
into a register. It uses the familiar pattern of `addiu` with `zero`. The
register it chooses is `at`, the assembler temporary from the list of registers
you saw earlier. This is the kind of scratch work `at` is for.

The next part is unusual. `div` doesn't write its result to a normal register.
The divide unit puts its results into a special pair of registers called
**HI and LO**: the quotient goes into LO, and the remainder goes into HI. A
separate instruction, `mflo` ("move from LO"), copies the quotient out. Here is
the whole sequence for a divide by 6:

```asm
addiu  at, zero, 6    # the divisor, parked in the scratch register
div    zero, a0, at   # LO = a0 / 6   (HI gets the remainder)
mflo   v0             # fetch the quotient into v0
nop                   # the divider is slow, so
nop                   #   the compiler spaces it out
jr     ra
nop
```

Two things to understand:

- That `zero` in the `div` operands is only how the three-operand form is
  printed. The results always go to HI and LO, never to a register named in
  the operands.
- The two `nop`s are **real and required**. The hardware divider takes many
  cycles, and IDO adds padding after `mflo` to be safe. The compiler adds the
  `nop`s itself, and your one-line C produces them automatically. This is the
  first example of something you will see constantly in N64 matching: the
  compiler adds its own patterns like these, and to match, you have to
  reproduce them too.

Read the divisor from the target's `addiu` line, the one that adds to `zero`.
That gives you the whole function.

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
