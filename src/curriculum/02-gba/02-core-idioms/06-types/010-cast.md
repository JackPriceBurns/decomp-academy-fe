---
id: 257bef8f-1e56-42bb-9e0a-ddef6a334024
slug: gba-types-cast
title: Casts You Can See
difficulty: 3
concepts:
  - narrow-types
  - casts
  - shifts
symbol: func_081da6b4
hints:
  - Two shift pairs on the same incoming value, then one add. Each pair is a
    cast; solve each one for its width and its signedness separately.
  - "One `s32` parameter, an `s32` result, and the same parameter is used twice
    with two different casts."
---

# A cast is a shift pair

Every narrowing you have seen so far was implied by a declaration - a `u8`
field, an `s16` parameter, a narrow return type. Write the cast yourself and you
get the same instructions, in the middle of an expression where you asked for
them.

`(u8)x` is `lsl #24` then `lsr #24`. `(s16)x` is `lsl #16` then `asr #16`. The
pattern is the one from the last few lessons: shift up by 32 minus the width,
shift back with `lsr` for an unsigned target type or `asr` for a signed one.

What makes casts worth their own lesson is that the obvious alternative compiles
to something else entirely. These two functions extract byte 1 of a value:

```asm
0        lsr       r0, #8
2        lsl       r0, #24
4        lsr       r0, #24
6        bx        lr
```

```asm
0        lsr       r0, #8
2        mov       r1, #255
4        and       r0, r1
6        bx        lr
```

The first wrote `(u8)(x >> 8)`, the second wrote `(x >> 8) & 255`. Identical
values, identical instruction counts, different instructions. agbcc never turns
a cast into a mask or a mask into a shift pair, so the target tells you which
one the original programmer typed. If you see `mov` and `and`, the source had a
mask; if you see a shift pair, the source had a cast.

That distinction gets sharper with 16 bits, where the mask constant no longer
fits in a `mov` at all and `x & 0xFFFF` drags a literal-pool word into the
function while `(u16)x` still costs two shifts.

Your target has two shift pairs reading the same source register, and one add.
Solve each pair on its own.

## Your task

Write `func_081da6b4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081da6b4(s32 x) {
    return (u16)x + (s8)x;
}
```
