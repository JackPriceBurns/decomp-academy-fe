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
    short-circuit in it. One branch enters the failure arm, the other jumps
    over it.
  - The `mov` of zero next to the load is not a variable. It is the offset
    operand that `ldrsh` has no way to encode as an immediate.
  - An `s16 *` table, an `s32` index and an `s32` limit in, an `s32` out. The
    guard rejects out-of-range indices and the accepted ones are read, then
    doubled.
---

# Bounds check, scale, load

Everything in this chapter comes together in the shape that real GBA code uses
constantly: check an index, use it to read a table, do something with the
result. The pieces are all familiar. What is worth studying is how they
arrange themselves around each other.

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

The base is copied out of `r0` on line 0, because `r0` is where the result has
to be built and the pointer is still needed after the compare. Here the reject
case is the one the `if` body writes, so the branch is taken when the compare
*succeeds*: `bge` jumps ahead to the arm that produces the failure value, and
the fall-through is the table read. That arm scales the index by two, adds the
base, loads a halfword, and then has to jump over the failure code to reach the
return, which is the only job the `b` on line 12 does. The failure value itself
is `mov r0, #1 / neg r0, r0`, because the immediate field has no room for a
sign.

Two things this example does not show, and you will need both.

The first is what a signed 16-bit table costs. Thumb's `ldrsh` exists in
exactly one form, `ldrsh rD, [rB, rM]`, with the offset in a register — there
is no immediate encoding at all. So even a load at a known address needs a
register holding zero, and gcc materialises one on the spot. A `mov rX, #0`
sitting immediately in front of an `ldrsh` is part of the load, and trying to
account for it in your C is the fastest way to lose an afternoon.

The second is what a condition with two halves does to the layout. A
short-circuited `||` puts a branch after each test: the first sends you into
the failure arm when it succeeds, the second jumps over the failure arm when it
fails. Both compares end up guarding the same body, and the failure arm ends up
sitting between the guard and the code it guards.

Your target contains two `mov` instructions that put zero in a register. They
have nothing to do with each other.

## Your task

Write `func_08238338` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08238338(s16 *tbl, s32 i, s32 n) {
    if (i < 0 || i >= n) return 0;
    return tbl[i] * 2;
}
```
