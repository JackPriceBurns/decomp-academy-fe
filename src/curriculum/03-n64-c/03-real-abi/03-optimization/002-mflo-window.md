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
  - "One instruction of real work is inside the window. Read which register is subtracted from which."
  - "The compiler adds the `nop` itself. A one-line C expression produces the whole listing, including the padding."
---

# Counting the slots after mflo

Since the warm-up divide, you have seen `nop`s follow an `mflo`. This lesson
makes the pattern precise, because at this game's settings it follows a fixed
rule: **IDO keeps two instruction slots between an `mflo` (or `mfhi`) and the
`jr ra`.** Real work can go in those slots. Any slot that real work does not
fill gets a `nop`.

Here is `mixed(a, b, c)`, which returns `a * b + c`:

```asm
multu  a0, a1      # HI:LO = a * b
mflo   t6          # fetch the low 32 bits: the product
addu   v0, t6, a2  # + c: one slot of the window, filled
nop                # the other slot: nothing left to put there
jr     ra
nop
```

Two things to note:

- **`multu` appears where you might expect `mult`.** For a 32-bit result the
  low word is the same either way, so IDO uses the unsigned form even for `s32`
  math. Expect to see it.
- Count from `mflo` to `jr`: the `addu` is one slot, and the `nop` is the
  second. Compare this with the plain `a * b` you met earlier. There, `mflo v0`
  was followed directly by *two* `nop`s, because there was nothing else to do.
  The rule is the same. Only what fills the slots is different.

The window exists because the multiply unit is slow, and this compiler pads
conservatively instead of proving that the pipeline is safe. The compiler emits
the padding for you. You can't write a `nop` in C, and you never need to. What
you *can* do is learn to expect it: when you see `mflo`, look two lines down
and expect either work or padding before the return.

The target has the same structure, with one real instruction in the window. The
order of that instruction's operands is what you need to work out.

## Your task

Write `func_80183c10` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80183c10(s32 x, s32 y, s32 z) {
    return x * y - z;
}
```
