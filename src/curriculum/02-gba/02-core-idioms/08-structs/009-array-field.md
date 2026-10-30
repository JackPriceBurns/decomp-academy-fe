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
  - "The `#n` in the three-operand `add rD, rB, #n` is where the array member starts inside the struct. An `lsl` on the index next to it gives the element size. If there is no shift at all, the elements are bytes."
  - The function takes a `struct Deck *` and an `s32`, and returns a `u32`. It does one indexed read from the array member and one plain read of a field that comes after the array.
---

# Two offsets, one address

An array member inside a struct needs two kinds of offset at once: a constant
offset to reach the member, and a scaled offset to reach the element. The
compiler emits them as separate instructions, in a pattern you can recognise.
First a three-operand `add rD, rB, #n` copies the base and adds the member's
offset in one step. Then a second `add` adds the scaled index.

Watch which register keeps the base. The struct base usually stays in a second
register, because the function still needs it for the other fields. The
address of the element is built in a separate register.

Here is a function that reads one element of a byte array inside a struct, plus
a field in front of the array:

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
the `#1` in the first add. The elements are single bytes, so the index needs no
scaling and goes straight in with the second add. Then comes the load at
`[r0, #0]`. Its offset is zero because the whole address is already in the
register. A separate `ldrb` at `[r2, #0]` reads `count`, using the base that
was saved in instruction 0.

If the elements had been halfwords or words, there would be an `lsl` on the
index before that second add, as in an array of structs. The member offset and
the element scale do not depend on each other. Read them separately and you get
the member and the index.

Your target indexes an array member of its own, and reads one more field after
it. Check the width of both loads.

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
