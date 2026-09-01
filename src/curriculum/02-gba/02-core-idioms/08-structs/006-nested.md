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
  - There is no instruction for "step into the inner struct". Add the member's
    offset within the outer struct to the field's offset within the inner one,
    and that single number is what appears in the load.
  - A `struct Body *` in, nothing out. Four loads and two stores, and the two
    halves of the body are the same statement written for a different member of
    the inner struct.
symbol: func_08252ff0
---

# Nesting is addition, and it happens at compile time

An inner struct is not a pointer. `b->pos.y` does not load `pos` and then index
it — `pos` *is* part of `b`, so the compiler adds the offset of `pos` inside
`Body` to the offset of `y` inside `Vec` and emits one load with the sum. Two
levels of nesting, one instruction, no trace of the inner type.

This means a nested access and a flat one are indistinguishable in the assembly.
`b->pos.y` at offset 8 looks exactly like a field called `posY` declared at
offset 8. The context block tells you which spelling the original used; the
assembly never will.

Here is a function reading across two nested members:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #10]
4        ldrh      r1, [r1, #4]
6        sub       r0, r1
8        bx        lr
```

The struct is `{ u32 tag; struct Range in; struct Range out; }` with
`struct Range { u16 lo; u16 hi; }`. `in` starts at 4 and `out` at 8. So offset 4
is `in.lo` (4 + 0) and offset 10 is `out.hi` (8 + 2). Both additions are done by
the compiler; both are invisible by the time you see the code.

Your target has six memory operations at four distinct offsets, and every store
goes back to an offset that was loaded a moment earlier — the update-in-place
shape from the writing lesson, applied to a nested member.

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
