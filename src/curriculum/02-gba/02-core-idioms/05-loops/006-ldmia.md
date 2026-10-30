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
  - Write the same kind of indexed sum you have already written. The compiler
    chooses the post-increment form by itself, and there is no way to write it
    in C.
  - "`eor` is exclusive or. An `s32 *` and a count in, `s32` out, with `^=`
    where the sum had `+=`."
symbol: func_08185918
---

# One instruction that loads and advances

Thumb has no post-increment load, which is a load that also advances its
pointer register. There is no `ldr r0, [r3], #4`, because that encoding does not
exist. Thumb does have a load-multiple with writeback, `ldmia rN!, {list}`. It
loads a list of registers from consecutive addresses and leaves the base
register pointing just past the last one. If you put exactly one register in the
list, you get a post-increment load, built from the only instruction that offers
writeback.

This is why almost every loop over an array of words in an agbcc build uses it.
Here is a loop that fills an array with -1:

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

`stmia r0!, {r2}` is the matching store. It writes r2 to `[r0]`, then advances
r0 by 4. Compare it with the halfword fill from the last lesson, which needed
`strh` followed by `add r0, #2`. There is no halfword load-multiple. So loops
over halfwords and bytes need a separate instruction to advance the pointer,
and loops over words do not.

The -1 in the preheader follows the rule for building constants that you already
know. Thumb `mov` takes an unsigned 8-bit immediate, so gcc builds a negative
constant by loading the positive value and then negating it:
`mov r2, #1 / neg r2, r2`.

gcc uses the load-multiple form only when three things are true:

- The element is exactly four bytes.
- The pointer is read once per trip.
- The advance is in the same straight run of instructions as the load.

If any of these is false, the loop uses a plain `ldr` and a separate `add`
instead. Later lessons in this chapter break each condition in turn. Now you
know what the normal version looks like.

Your target's loop uses this instruction. Read closely what sits between the
load and the countdown.

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
