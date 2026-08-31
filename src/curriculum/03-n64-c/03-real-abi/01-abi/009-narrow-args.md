---
id: ca803ec8-f485-413e-88c4-59cd02f7d3df
slug: abi-narrow-args
title: Narrow Arguments Re-Extend Themselves
difficulty: 3
concepts:
  - abi
  - homing
  - narrow-types
  - arguments
symbol: func_802a00f8
hints:
  - "`andi` with 65535 keeps exactly the low 16 bits, zero-extending. Which C
    type promises an unsigned 16-bit value?"
  - "Only one argument is homed — that's your narrow one, and it's the first parameter. The other is a plain `s32`."
---

# The callee doesn't trust the high bits

A `s16` or `u8` argument still travels in a full 32-bit register — there's no
half-size `a0`. The o32 rule is that the *callee* must not assume the upper
bits are clean, so on arrival IDO re-extends every narrow argument itself. And
narrow counts as "not a plain word", so — as you learned last lesson — narrow
arguments get **homed** too. Two fingerprints for the price of one.

The re-extension differs by signedness. Here's `narrowAdd(a, b)` with both
parameters declared `s16`:

```asm
sw    a0, 0(sp)      # narrow ⇒ homed
sll   t6, a0, 16     # push the low half up…
sw    a1, 4(sp)      # (b homed too)
sll   t8, a1, 16
sra   a1, t8, 16     # …and arithmetic-shift back: sign bits refilled
sra   a0, t6, 16
addu  v0, a0, a1
jr    ra
nop
```

The `sll 16` / `sra 16` pair is the **signed** narrow signature: shift the
16-bit value to the top, then shift back arithmetically so the sign bit smears
down the upper half. For a signed byte it's the same dance with shift amount 24.

**Unsigned** narrows don't need the sign smear — a mask does the job:
`andi rt, rs, 255` for a `u8`, `andi rt, rs, 65535` for a `u16`. Zero-extension
in one instruction.

So narrow argument types read straight off the listing:

- `sll`/`sra` by 16 → `s16`; by 24 → `s8`
- `andi 65535` → `u16`; `andi 255` → `u8`
- plus a homing `sw` for each narrow argument, interleaved by the scheduler

The target does one add. The mask and the homing tell you which argument is
narrow, and what to declare.

## Your task

Write `func_802a00f8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802a00f8(u16 count, s32 base) {
    return base + count;
}
```
