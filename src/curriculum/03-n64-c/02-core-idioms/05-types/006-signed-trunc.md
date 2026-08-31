---
id: 7e5d4241-d1b3-4c66-a2fb-53ce472d40f0
slug: types-signed-trunc
title: "Casting Down, Signed: The Shift Pair"
difficulty: 2
concepts:
  - types
  - casts
  - shifts
  - sign-extension
symbol: func_80397508
hints:
  - "Addition, then the pair. The shift amount tells you the width you're casting to — 32 minus the amount."
  - "Both shifts use the same amount; only the middle value passes between them. One cast of one sum."
---

# Up and back down again

`andi` can't cast to a *signed* narrow type — zeroing the top bits
destroys the sign. The signed cast needs the top bits to mirror bit 7 (or
bit 15), and IDO builds that with a two-instruction idiom you should file
next to the division fix-ups: **shift all the way up, shift all the way
back down, arithmetically**. Here's a cast to `s8`:

```c
s32 sign8(s32 x) {
    return (s8)x;
}
```

```asm
sll   v0, a0, 24    # low byte moves to the TOP of the register
sra   t6, v0, 24    # …and rides back down, dragging its sign bit
or    v0, t6, zero
jr    ra
nop
```

Follow a value through: `x = 0x1234`. After `sll 24`: `0x34000000` — the
kept byte now *owns* the sign position. After `sra 24`: `0x00000034`. But
feed it `x = 0x12F0`: `sll` gives `0xF0000000`, a negative number, and
`sra` smears that sign all the way down: `0xFFFFFFF0` — which is -16,
exactly what `(s8)0xF0` means. The pair manufactures sign extension for a
value that never went through memory.

The amounts decode the width: **24 = casting to 8 bits, 16 = casting to 16
bits**. `sll k` + `sra k` back-to-back on the same value is always a
signed downcast — one cast, not two shifts, and writing it as two shifts
in C would be wrong anyway (C's `<<` on a signed 32-bit value doesn't
promise this dance; the cast does).

So the truncation family is complete:

| to | instruction(s) |
|----|----------------|
| `u8` / `u16` | `andi 0xff` / `andi 0xffff` |
| `s8` / `s16` | `sll 24; sra 24` / `sll 16; sra 16` |

The target folds two words together and returns the sum, seen through a
signed halfword.

## Your task

Write `func_80397508` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80397508(s32 a, s32 b) {
    return (s16)(a + b);
}
```
