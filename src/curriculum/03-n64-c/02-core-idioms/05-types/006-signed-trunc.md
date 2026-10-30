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
  - "There is an addition, then the shift pair. The shift amount tells you the width of the cast: it is 32 minus the amount."
  - "Both shifts use the same amount, and only the intermediate value passes from one to the other. The C is one cast of one sum."
---

# Shifting up and back down

`andi` cannot cast to a *signed* narrow type, because zeroing the top bits
destroys the sign. A signed cast needs the top bits to be copies of bit 7 (or
bit 15). IDO builds this with a two-instruction idiom. Remember it alongside
the division fix-ups: **shift all the way up, then shift all the way back down
with an arithmetic shift**. Here is a cast to `s8`:

```c
s32 sign8(s32 x) {
    return (s8)x;
}
```

```asm
sll   v0, a0, 24    # low byte moves to the TOP of the register
sra   t6, v0, 24    # …then shifts back down, copying its sign bit
or    v0, t6, zero
jr    ra
nop
```

Follow a value through it. Take `x = 0x1234`. After `sll 24`, the register
holds `0x34000000`, so the top bit of the kept byte is now the sign bit. After
`sra 24`, the register holds `0x00000034`. Now try `x = 0x12F0`. `sll` gives
`0xF0000000`, which is a negative number, and `sra` copies that sign bit into
every bit above the byte. The result is `0xFFFFFFF0`, which is -16. That is
exactly what `(s8)0xF0` means. The pair performs sign extension on a value
that never went through memory.

The shift amount gives you the width: **24 means a cast to 8 bits, and 16
means a cast to 16 bits**. `sll k` followed directly by `sra k` on the same
value is always a signed downcast, so read it as one cast. Writing two shifts
in C instead would be wrong, because C does not guarantee this result for `<<`
on a signed 32-bit value. The cast does guarantee it.

So the truncation family is complete:

| to | instruction(s) |
|----|----------------|
| `u8` / `u16` | `andi 0xff` / `andi 0xffff` |
| `s8` / `s16` | `sll 24; sra 24` / `sll 16; sra 16` |

The target adds its arguments and returns the sum, cast to a signed narrow
type. Read the shift amounts to find the width.

## Your task

Write `func_80397508` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80397508(s32 a, s32 b) {
    return (s16)(a + b);
}
```
