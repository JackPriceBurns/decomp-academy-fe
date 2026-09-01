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
  - Match each load to the field it reads by its byte offset, then compare the
    load instruction with how that field is declared. They disagree both times.
  - "One `Pair *` in, an `s32` out - each field is read with the signedness of
    the other one, and the first field is the left operand of the subtraction."
---

# Changing the sign without changing the bits

`s16` and `u16` occupy the same two bytes and hold the same bit patterns. The
only thing that separates them is what happens to bit 15 when the value is
widened to 32 bits, and that decision is made by a single instruction.

In a register the two are one mnemonic apart:

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

The first is an `s16` argument read as unsigned, the second a `u16` argument
read as signed. Same shift counts, same addition, and the reinterpretation lives
entirely in the choice between `lsr` and `asr`.

At a load there are no shifts to look at, because the load instruction carries
the signedness itself. Reading a `u16` is `ldrh`. Reading an `s16` is a
materialised offset and `ldrsh`. Cast at the point of the load and agbcc picks
the other instruction - an `s16` element read as unsigned becomes a plain
`ldrh`, and a `u16` element read as signed becomes `mov` plus `ldrsh`. Nothing
extra is emitted to mark the cast.

That is the trap. The load instruction tells you the signedness of the
*expression*, and the declared type of the thing being loaded is a separate
question. When those two disagree, the difference has to be spelled out in the
source, and the assembly gives you no other clue that it was.

The struct in your target fixes both field types. Line each load up against the
field it reads.

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
