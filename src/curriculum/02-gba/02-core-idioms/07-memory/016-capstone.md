---
id: d8fa0ac2-9465-4006-85e8-276f9d3e1462
slug: gba-memory-capstone
title: "Capstone: A Lookup Table"
difficulty: 5
concepts:
  - pointers
  - arrays
  - branches
  - narrow-types
symbol: func_08238338
hints:
  - Two compares that both protect the same body are one condition with a
    short-circuit in it. One branch goes into the failure arm, and the other
    jumps over it.
  - The `mov` of zero next to the load is not a variable. It is the offset
    operand that `ldrsh` has no way to encode as an immediate.
  - It takes an `s16 *` table, an `s32` index and an `s32` limit, and returns
    an `s32`. The guard rejects indices that are out of range. The accepted
    ones are read, then doubled.
---

# Bounds check, scale, load

This lesson brings the chapter together in a pattern that real GBA code uses
all the time: check an index, use it to read a table, and do something with the
result. You have seen all the parts before. What is worth studying is how they
are arranged around each other.

```asm
0        mov       r3, r0
2        cmp       r1, r2
4        bge       14 ~>
6        lsl       r0, r1, #1
8        add       r0, r3
10       ldrh      r0, [r0, #0]
12       b         18 ~>
14     ~>mov       r0, #1
16       neg       r0, r0
18     ~>bx        lr
```

The base is copied out of `r0` on line 0. `r0` is where the result has to be
built, and the pointer is still needed after the compare. In this example the
reject case is the body of the `if`, so the branch is taken when the compare
*succeeds*. `bge` jumps ahead to the arm that produces the failure value, and
the fall-through path is the table read. That arm scales the index by two, adds
the base, and loads a halfword. Then it has to jump over the failure code to
reach the return, and that is the only job of the `b` on line 12. The failure
value is built with `mov r0, #1 / neg r0, r0`, because the immediate field has
no room for a sign.

This example does not show two things that you will need.

The first is the cost of a signed 16-bit table. Thumb's `ldrsh` has only one
form, `ldrsh rD, [rB, rM]`, with the offset in a register. It has no immediate
form at all. So even a load from a known address needs a register that holds
zero, and gcc creates one right before the load. A `mov rX, #0` directly
before an `ldrsh` is part of the load. Do not try to reproduce it in your C.
The load needs it, and gcc adds it for you.

The second is how a condition with two halves changes the layout. A
short-circuited `||` puts a branch after each test. The first branch sends you
into the failure arm when its test succeeds. The second branch jumps over the
failure arm when its test fails. Both compares end up guarding the same body,
and the failure arm ends up between the guard and the code it guards.

Your target contains two `mov` instructions that put zero in a register. They
are not related to each other.

## Your task

Write `func_08238338` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08238338(s16 *tbl, s32 i, s32 n) {
    if (i < 0 || i >= n) return 0;
    return tbl[i] * 2;
}
```
