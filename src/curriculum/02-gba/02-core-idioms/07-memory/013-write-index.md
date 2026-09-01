---
id: 235facb1-81d6-45e0-bc0c-b2537e97a934
slug: gba-memory-write-index
title: Storing at a Computed Index
difficulty: 3
concepts:
  - pointers
  - arrays
  - stores
symbol: func_0822acdc
hints:
  - The load and the store use the same base register and the same offset, so
    they are the same element of the same array.
  - An `s32 *`, an `s32` index and an `s32` value in, nothing out. One
    statement does the whole job.
---

# The address is computed once

A store with a variable index scales exactly like a load: shift the index by
the element size, add the base, and use the resulting register with an offset
of zero. The only difference is which way the data moves and that the register
being stored is a value rather than a destination.

```asm
0        lsl       r1, #1
2        add       r1, r0
4        strh      r2, [r1, #4]
6        bx        lr
```

Halfword elements, so `lsl #1`; then `strh r2, [r1, #4]` writes the third
argument two elements past the computed position — the offset field is in
bytes and the elements are two bytes each. The constant part of the index rode
into the instruction; only the variable part needed the shift and the add.

Now the shape worth recognising. When a listing computes an address once and
then both loads *and* stores through it at the same offset, the C touched one
element, not two. A compound assignment such as `t[k] ^= m` and the longhand
`t[k] = t[k] ^ m` are the same thing to gcc and both produce that shape; two
different indices would give you two shifts and two adds, so counting
scale-and-add pairs counts elements.

Naming the address does change things, though. A local pointer set to the base
plus the index, then read and written through, still computes the address once,
but gcc then adds the index into the base register destructively and loads into
a different register. The instructions are the same and the register names are
not, which in a diff is a miss. Reach for the index form first.

Your target forms one address and uses it twice.

## Your task

Write `func_0822acdc` to reproduce the target assembly.

<!-- solution -->
```c
void func_0822acdc(s32 *p, s32 i, s32 v) {
    p[i] += v;
}
```
