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
  - Two post-increment loads means two arrays walked in lockstep, and the two
    instructions after them are the whole body.
  - The subtract is `r0 = r0 - r1`, and r0 came from the cursor that was set up
    from the first argument.
  - Two `s32 *` and an `s32` count in, `s32` out - accumulate the difference
    between the two elements at each position, first array minus second.
symbol: func_081976e8
---

# Counting live values from the push list

Walk two arrays at once and the loop has to carry two of most things. Each array
needs its own cursor, both cursors have to survive the body, and the body needs
scratch registers for the values it loads. Only r0 through r7 are freely usable
in Thumb, so this is where a loop stops being a leaf function.

Here is a loop that reads one array, shifts, and writes another:

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

Count what has to stay alive across the back-edge: the source cursor in r1, the
destination cursor in r3, the countdown in r2. Three. The body needs one scratch
register for the value in flight, which is r0. Four low registers in total, and
the function has r0 through r3 available without saving anything, so there is no
push and the loop stays a leaf.

The destination pointer moved to r3 because r0 is the scratch. That is the same
argument-protection move from the counting-up lesson, done here without any cost
because r3 is caller-saved too.

Add one more live value and the arithmetic stops working out. An accumulator, or
a second value that has to be held while the first is loaded, pushes the total
past four, and the extra values land in r4 and upward — which have to be saved
and restored, and which turn the epilogue into `pop {rN} / bx rN`. Before you
write any C, count the values your target's loop carries and check them against
its push list; if the counts disagree, your reading of the body is wrong.

Your target carries more than four. Work out what each `ldmia` feeds and which
register holds the result being built up.

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
