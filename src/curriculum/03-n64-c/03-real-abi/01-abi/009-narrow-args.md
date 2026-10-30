---
id: ca803ec8-f485-413e-88c4-59cd02f7d3df
slug: abi-narrow-args
title: Re-Extending Narrow Arguments
difficulty: 3
concepts:
  - abi
  - homing
  - narrow-types
  - arguments
symbol: func_802a00f8
hints:
  - "`andi` with 65535 keeps exactly the low 16 bits and fills the rest with
    zeros. Which C type holds an unsigned 16-bit value?"
  - "Only one argument is homed. That is your narrow one, and it is the first parameter. The other is a plain `s32`."
---

# The callee does not rely on the high bits

An `s16` or `u8` argument still travels in a full 32-bit register. There is no
half-size `a0`. The o32 rule is that the *callee* must not assume the upper
bits are clean, so IDO re-extends every narrow argument itself when the
function starts. A narrow argument also counts as "not a plain word", so, as
you learned in the last lesson, narrow arguments are **homed** too. This means
each narrow argument shows up twice in the listing: in the re-extension and in
the homing store.

The re-extension depends on signedness. This is `narrowAdd(a, b)`, with both
parameters declared `s16`:

```asm
sw    a0, 0(sp)      # narrow, so homed
sll   t6, a0, 16     # shift the low half to the top
sw    a1, 4(sp)      # (b homed too)
sll   t8, a1, 16
sra   a1, t8, 16     # arithmetic shift back down: fills in the sign bits
sra   a0, t6, 16
addu  v0, a0, a1
jr    ra
nop
```

The `sll 16` / `sra 16` pair is the pattern for a **signed** narrow argument.
It shifts the 16-bit value to the top of the register, then shifts it back
arithmetically, which copies the sign bit into the whole upper half. A signed
byte uses the same pair with a shift amount of 24.

**Unsigned** narrow arguments don't need the sign copied. A mask is enough:
`andi rt, rs, 255` for a `u8`, and `andi rt, rs, 65535` for a `u16`. That
zero-extends the value in one instruction.

So you can read narrow argument types directly from the listing:

- `sll`/`sra` by 16 → `s16`; by 24 → `s8`
- `andi 65535` → `u16`; `andi 255` → `u8`
- a homing `sw` for each narrow argument, mixed in with the other instructions
  by the scheduler

The target does one add. The mask and the homing store tell you which argument
is narrow and what type to declare.

## Your task

Write `func_802a00f8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802a00f8(u16 count, s32 base) {
    return base + count;
}
```
