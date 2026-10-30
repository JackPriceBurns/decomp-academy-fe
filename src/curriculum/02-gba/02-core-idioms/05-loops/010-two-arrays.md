---
id: 000f0a9e-4cce-4645-9996-6df7cfa6605d
slug: gba-loops-two-arrays
title: Two Cursors
difficulty: 4
concepts:
  - loops
  - arrays
  - registers
hints:
  - Two post-increment loads mean two arrays walked together, one element of
    each per trip. The two instructions after them are the whole body.
  - The subtract is `r0 = r0 - r1`, and r0 came from the cursor that was set up
    from the first argument.
  - Two `s32 *` and an `s32` count in, `s32` out. Add up the difference between
    the two elements at each position, first array minus second.
symbol: func_081976e8
---

# Counting live values from the push list

When a loop walks two arrays at once, it has to carry two of most things. Each
array needs its own cursor, and both cursors have to survive the body. The body
also needs scratch registers for the values it loads. Only r0 through r7 can be
used freely in Thumb, so this is the point where a loop stops being a leaf
function.

Here is a loop that reads from one array, shifts each value, and writes it to
another:

```asm
0        cmp       r2, #0
2        ble       18 ~>
4        mov       r3, r0
6      ~>ldmia     r1!, {r0}
8        lsl       r0, #1
10       stmia     r3!, {r0}
12       sub       r2, #1
14       cmp       r2, #0
16       bne       6 ~>
18     ~>bx        lr
```

Count the values that have to stay live across the back-edge: the source cursor
in r1, the destination cursor in r3, and the countdown in r2. That is three. The
body needs one scratch register for the value being copied, which is r0. That
makes four low registers in total. The function can use r0 through r3 without
saving anything, so there is no push and the loop stays a leaf.

The destination pointer moved to r3 because r0 is the scratch register. This is
the same move that protected an argument in the counting-up lesson. Here it
costs nothing, because r3 is also caller-saved.

Add one more live value and there are not enough of these registers. An
accumulator, or a second value that has to be held while the first is loaded,
takes the total past four. The extra values go in r4 and up. Those registers
have to be saved and restored, and they turn the epilogue into
`pop {rN} / bx rN`. Before you write any C, count the values your target's loop
carries and check them against its push list. If the counts do not agree, your
reading of the body is wrong.

Your target carries more than four values. Work out what uses the value from
each `ldmia`, and which register holds the result being built up.

## Your task

Write `func_081976e8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081976e8(s32 *a, s32 *b, s32 n) {
    s32 i;
    s32 t = 0;
    for (i = 0; i < n; i++)
        t += a[i] - b[i];
    return t;
}
```
