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
  - It takes an `s32 *`, an `s32` index and an `s32` value, and returns
    nothing. One statement does all the work.
---

# The address is computed once

A store with a variable index scales the index exactly like a load does. It
shifts the index by the element size, adds the base, and uses the result
register with an offset of zero. The only differences are the direction the
data moves, and that the stored register holds a value instead of being a
destination.

```asm
0        lsl       r1, #1
2        add       r1, r0
4        strh      r2, [r1, #4]
6        bx        lr
```

The elements are halfwords, so the index is shifted with `lsl #1`. Then
`strh r2, [r1, #4]` writes the third argument two elements past the computed
position. The offset field is in bytes, and each element is two bytes. The
constant part of the index went into the instruction. Only the variable part
needed the shift and the add.

This pattern is worth learning to recognise. When a listing computes an address
once and then both loads *and* stores through it at the same offset, the C
accessed one element, not two. A compound assignment such as `t[k] ^= m` and
the longer form `t[k] = t[k] ^ m` are the same to gcc, and both produce this
pattern. Two different indices would give you two shifts and two adds. So the
number of scale-and-add pairs is the number of elements.

Giving the address a name does change the output. Suppose you use a local
pointer set to the base plus the index, and then read and write through it. The
address is still computed once, but gcc then adds the index into the base
register in place and loads into a different register. The instructions are the
same and the register names differ, and in a diff that counts as a mismatch.
Try the index form first.

Your target forms one address and uses it twice.

## Your task

Write `func_0822acdc` to reproduce the target assembly.

<!-- solution -->
```c
void func_0822acdc(s32 *p, s32 i, s32 v) {
    p[i] += v;
}
```
