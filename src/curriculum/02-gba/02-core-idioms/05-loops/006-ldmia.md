---
id: c60a17d7-2add-4907-b0e4-0c5120c34236
slug: gba-loops-ldmia
title: The Post-Increment Load
difficulty: 3
concepts:
  - loops
  - arrays
  - addressing
hints:
  - "`ldmia r3!, {r0}` is a load and a pointer advance in one instruction, so
    there is no separate `add r3, #4` to look for. The element size is 4."
  - Write the same shape of indexed sum you have already written; the
    post-increment form is the compiler's choice, not something you can spell in
    C.
  - "`eor` is exclusive or. An `s32 *` and a count in, `s32` out, with `^=`
    where the sum had `+=`."
symbol: func_08185918
---

# One instruction that loads and advances

Thumb has no post-increment load. There is no `ldr r0, [r3], #4` — the encoding
does not exist. What Thumb does have is load-multiple with writeback,
`ldmia rN!, {list}`, which loads a list of registers from consecutive addresses
and leaves the base pointing past the last one. Put exactly one register in the
list and you have a post-increment load built out of the only instruction that
offers writeback.

That is why almost every word-sized array walk in an agbcc build looks like
this. Here is a loop that fills an array with -1:

```asm
0        cmp       r1, #0
2        ble       16 ~>
4        mov       r2, #1
6        neg       r2, r2
8      ~>stmia     r0!, {r2}
10       sub       r1, #1
12       cmp       r1, #0
14       bne       8 ~>
16     ~>bx        lr
```

`stmia r0!, {r2}` is the store mirror: write r2 to `[r0]`, then advance r0 by 4.
Compare it with the halfword fill from the last lesson, which needed `strh`
followed by `add r0, #2`. There is no halfword load-multiple, so halfwords and
bytes pay for their advance separately and words do not.

The -1 in the preheader is the constant-building rule you already know. Thumb
`mov` takes an unsigned 8-bit immediate, so a negative constant is built as the
positive one and negated: `mov r2, #1 / neg r2, r2`.

Three things have to be true before gcc reaches for the load-multiple form: the
element is exactly four bytes, the pointer is read once per trip, and the
advance sits in the same straight run of instructions as the load. Break any of
them and the loop falls back to a plain `ldr` and a separate `add`. Later
lessons in this chapter break each of them in turn, and now you know what the
undamaged version looks like.

Your target's loop is built on this instruction. The part to read closely is
what sits between the load and the countdown.

## Your task

Write `func_08185918` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08185918(s32 *a, s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t ^= a[i];
    return t;
}
```
