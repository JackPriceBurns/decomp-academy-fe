---
id: 487a1d98-4cee-4507-b252-eed90aa0da9c
slug: gba-structs-array-field
title: An Array Inside a Struct
difficulty: 3
concepts:
  - structs
  - arrays
  - addressing
symbol: func_0826064c
hints:
  - "The `#n` in the three-operand `add rD, rB, #n` is where the array member starts inside the struct. An `lsl` on the index beside it gives the element size; no shift at all means byte elements."
  - A `struct Deck *` and an `s32` in, a `u32` out. One indexed read from the array member and one plain read of a field that sits after it.
---

# Two offsets, one address

An array member inside a struct needs both kinds of offset at once: a constant
one to reach the member, and a scaled one to reach the element. The compiler
emits them as separate instructions, and the shape is distinctive — a
three-operand `add rD, rB, #n` that copies the base while adding the member's
offset, then a second `add` that folds in the scaled index.

Watch which register survives. The struct base is usually kept in a second
register, because the function still needs it for the other fields, and the
address of the element is built alongside it.

Here is a function reading one element of a byte array inside a struct, plus a
field in front of it:

```asm
0        mov       r2, r0
2        add       r0, r2, #1
4        add       r0, r1
6        ldrb      r0, [r0, #0]
8        ldrb      r1, [r2, #0]
10       add       r0, r1
12       bx        lr
```

The struct is `{ u8 count; u8 cell[16]; }`. `cell` starts at offset 1, which is
the `#1` in the first add; the index needs no scaling at all because the
elements are single bytes, so it goes straight in with the second add. Then the
load at `[r0, #0]` — offset zero, because the whole address is already in the
register — and a separate `ldrb` at `[r2, #0]` for `count`, from the base that
was saved in instruction 0.

If the elements had been halfwords or words there would be an `lsl` on the index
before that second add, exactly as in the array-of-structs case. The member
offset and the element scale are independent; read them separately and you get
the member and the index.

Your target indexes an array member of its own, and reads one more field
afterwards. Mind the width of both loads.

## Your task

Write `func_0826064c` to reproduce the target assembly.

<!-- context -->
```c
struct Deck { u32 seed; u16 card[16]; u16 top; };
```

<!-- solution -->
```c
u32 func_0826064c(struct Deck *d, s32 i) {
    return d->card[i] - d->top;
}
```
