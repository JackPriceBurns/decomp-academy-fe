---
id: 80cc742b-b1f1-4b86-9f3c-cf4692474839
slug: gba-structs-nested
title: Nested Structs
difficulty: 3
concepts:
  - structs
  - offsets
  - stores
hints:
  - There is no instruction that steps into the inner struct. Add the member's
    offset within the outer struct to the field's offset within the inner
    struct. That single number is what appears in the load.
  - The function takes a `struct Body *` and returns nothing. It does four loads
    and two stores. The two halves of the function body are the same statement,
    written for a different member of the inner struct.
symbol: func_08252ff0
---

# Nesting is addition, done at compile time

An inner struct is stored inside the outer struct. It is not a pointer.
`b->pos.y` does not load `pos` and then index into it, because `pos` *is* part
of `b`. The compiler adds the offset of `pos` inside `Body` to the offset of `y`
inside `Vec`, and emits one load with the sum. Two levels of nesting become one
instruction, with no trace of the inner type.

This means you cannot tell a nested access from a flat one in the assembly.
`b->pos.y` at offset 8 looks the same as a field called `posY` declared at
offset 8. The context block tells you which form the original code used. The
assembly never will.

Here is a function that reads fields from two nested members:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #10]
4        ldrh      r1, [r1, #4]
6        sub       r0, r1
8        bx        lr
```

The struct is `{ u32 tag; struct Range in; struct Range out; }`, with
`struct Range { u16 lo; u16 hi; }`. `in` starts at 4 and `out` at 8. So offset
4 is `in.lo` (4 + 0), and offset 10 is `out.hi` (8 + 2). The compiler does both
additions, and neither one is visible in the code you read.

Your target has six memory operations at four different offsets. Every store
goes back to an offset that was loaded shortly before. This is the
update-in-place pattern from the lesson on writing a field, applied to a nested
member.

## Your task

Write `func_08252ff0` to reproduce the target assembly.

<!-- context -->
```c
struct Vec { s32 x; s32 y; };
struct Body { s32 id; struct Vec pos; struct Vec vel; };
```

<!-- solution -->
```c
void func_08252ff0(struct Body *b) {
    b->pos.x = b->pos.x + b->vel.x;
    b->pos.y = b->pos.y + b->vel.y;
}
```
