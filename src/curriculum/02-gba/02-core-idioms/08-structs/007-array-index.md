---
id: d77ce5f7-0b9a-4da2-8355-e2e2717e0561
slug: gba-structs-array-index
title: An Array of Structs
difficulty: 3
concepts:
  - structs
  - arrays
  - shifts
hints:
  - The shift amount is log2 of the struct size. The load's own offset is the
    field inside the element that the index selected.
  - The function takes a `struct Slot *` and two `s32` indices, and returns a
    `u32`. Both indices are scaled the same way, and both loads read the same
    field.
symbol: func_08257764
---

# The shift gives you the size

To index an array of structs, the compiler multiplies the index by `sizeof` the
element. When that size is a power of two, the multiply becomes a shift, and
the shift amount tells you the size: `lsl #2` is a 4-byte element, `lsl #3` an
8-byte one and `lsl #4` a 16-byte one.

The sequence always has the same three steps: scale the index, add it to the
base, then load. The *field* offset inside the element goes in the load's own
immediate, because it does not depend on the index. So `lsl #4`, then `add`,
then `ldr [rB, #8]` means "element `i` of an array of 16-byte structs, third
word".

Here is a function that reads two byte fields from one element:

```asm
0        lsl       r1, #2
2        add       r1, r0
4        ldrb      r0, [r1, #1]
6        ldrb      r1, [r1, #2]
8        add       r0, r1
10       bx        lr
```

The element is `struct Rgb { u8 r, g, b, a; }`, which is four bytes, so the
index is shifted by 2. Once `r1` holds the base plus the scaled index, both
fields are read from it with plain immediates: offset 1 is `g` and offset 2 is
`b`. The address arithmetic is done once and reused, so two field reads from
the same element share a single `lsl`/`add`.

Your own target scales twice. Work out why one `lsl` was not enough.

## Your task

Write `func_08257764` to reproduce the target assembly.

<!-- context -->
```c
struct Slot { u32 item; u32 count; };
```

<!-- solution -->
```c
u32 func_08257764(struct Slot *inv, s32 i, s32 j) {
    return inv[i].count - inv[j].count;
}
```
