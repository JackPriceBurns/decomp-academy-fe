---
id: c7de1d56-b38c-40ee-8de1-9a9cfc58e716
slug: gba-types-sign-change
title: Same Width, Different Sign
difficulty: 3
concepts:
  - narrow-types
  - casts
  - loads
symbol: func_081dee28
hints:
  - Use the byte offset to match each load to the field it reads. Then compare
    the load instruction with how that field is declared. They disagree both
    times.
  - The function takes one `Pair *` and returns an `s32`. Each field is read with
    the signedness of the other field, and the first field is the left operand
    of the subtraction.
---

# Changing the sign without changing the bits

`s16` and `u16` use the same two bytes and hold the same bit patterns. The only
difference is what happens to bit 15 when the value is widened to 32 bits. A
single instruction decides that.

In a register, the two differ by one mnemonic:

```asm
0        lsl       r0, #16
2        lsr       r0, #16
4        add       r0, #1
6        bx        lr
```

```asm
0        lsl       r0, #16
2        asr       r0, #16
4        add       r0, #1
6        bx        lr
```

The first is an `s16` argument read as unsigned, and the second is a `u16`
argument read as signed. The shift counts and the addition are the same. The
only change is the choice between `lsr` and `asr`.

At a load there are no shifts to look at, because the load instruction itself
sets the signedness. Reading a `u16` is `ldrh`. Reading an `s16` is a `mov`
that puts the offset in a register, then `ldrsh`. If you cast at the point of
the load, agbcc picks the other instruction. An `s16` element read as unsigned
becomes a plain `ldrh`, and a `u16` element read as signed becomes `mov` plus
`ldrsh`. No extra instruction marks the cast.

Be careful here. The load instruction tells you the signedness of the
*expression*. The declared type of the value being loaded is a separate
question. When the two disagree, the difference has to be written out in the
source, and the assembly gives you no other clue that it was.

The struct in your target gives the types of both fields. Match each load to
the field it reads.

## Your task

Write `func_081dee28` to reproduce the target assembly.

<!-- context -->
```c
typedef struct { s16 lo; u16 hi; } Pair;
```

<!-- solution -->
```c
s32 func_081dee28(Pair *s) {
    return (u16)s->lo - (s16)s->hi;
}
```
