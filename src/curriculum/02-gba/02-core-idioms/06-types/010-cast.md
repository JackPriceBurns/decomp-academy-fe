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
  - There are two shift pairs on the same incoming value, then one add. Each pair
    is a cast. Work out the width and signedness of each one separately.
  - The function takes one `s32` parameter and returns an `s32`. It uses the
    parameter twice, with two different casts.
---

# A cast is a shift pair

Every narrowing you have seen so far came from a declaration, such as a `u8`
field, an `s16` parameter or a narrow return type. If you write the cast
yourself, you get the same instructions, placed in the middle of the expression
where you wrote the cast.

`(u8)x` is `lsl #24` then `lsr #24`. `(s16)x` is `lsl #16` then `asr #16`. This
is the pattern from the last few lessons. Shift left by 32 minus the width, then
shift back with `lsr` for an unsigned target type or `asr` for a signed one.

Casts get their own lesson because the common alternative, a mask, compiles to
different code. These two functions both extract byte 1 of a value:

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

The first was written as `(u8)(x >> 8)` and the second as `(x >> 8) & 255`.
They produce the same value with the same number of instructions, but the
instructions are different. agbcc never turns a cast into a mask, or a mask into
a shift pair. So the target tells you which one the original programmer wrote.
If you see `mov` and `and`, the source had a mask. If you see a shift pair, the
source had a cast.

The difference is larger with 16 bits. The mask constant no longer fits in a
`mov`, so `x & 0xFFFF` adds a word in the literal pool to the function.
`(u16)x` still costs only two shifts.

Your target has two shift pairs that read the same source register, and one
add. Work out each pair on its own.

## Your task

Write `func_081da6b4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081da6b4(s32 x) {
    return (u16)x + (s8)x;
}
```
