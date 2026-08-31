---
id: 460f045c-4cab-4046-a227-df909a68be66
slug: opt-mflo-window
title: The Two-Slot Window After mflo
difficulty: 2
concepts:
  - optimizer
  - hi-lo
  - hazards
  - multiply
symbol: func_80183c10
hints:
  - "One instruction of real work sits inside the window; read which register is subtracted from which."
  - "The `nop` is the compiler's — a one-line C expression produces the whole listing, padding included."
---

# Counting the daylight after mflo

You've seen `nop`s trail an `mflo` since the warm-up divide. Time to make the
pattern precise, because at this game's settings it follows a rule you can
count on: **IDO keeps two instruction slots between an `mflo` (or `mfhi`) and
the `jr ra`.** Real work can occupy those slots; whatever real work doesn't
fill, `nop`s do.

Here's `mixed(a, b, c)`, which returns `a * b + c`:

```asm
multu  a0, a1      # HI:LO = a * b
mflo   t6          # fetch the low 32 bits — the product
addu   v0, t6, a2  # + c … one slot of the window, filled
nop                # the other slot — nothing left to put there
jr     ra
nop
```

Two things to absorb:

- **`multu`, not `mult`.** For a 32-bit result the low word is identical
  either way, so IDO uses the unsigned form even for `s32` math. Expect it.
- Count from `mflo` to `jr`: the `addu` is one slot, the `nop` is the second.
  Compare the pure `a * b` you met earlier — `mflo v0` straight into *two*
  `nop`s, because nothing needed doing. Same rule, different fill.

Why the window exists: the multiply unit is slow, and this compiler pads
conservatively rather than proving the pipeline safe. The padding is emitted
for you — you can't write a `nop` in C, and you never need to. What you *can*
do is stop being surprised: see `mflo`, glance down two lines, and expect
either work or padding before the return.

The target has the same skeleton with one real instruction in the window.
Its operand order is the whole puzzle.

## Your task

Write `func_80183c10` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80183c10(s32 x, s32 y, s32 z) {
    return x * y - z;
}
```
