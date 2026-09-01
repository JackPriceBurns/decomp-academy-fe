---
id: 07dcd127-0d9a-45da-a0bb-11cb03d768fe
slug: gba-loops-anatomy
title: The Shape of a Loop
difficulty: 2
concepts:
  - loops
  - control-flow
  - branches
hints:
  - Find the branch that jumps backwards. Its destination is the first
    instruction of the body, and everything between the two is one trip.
  - The forward branch above the body is the entry test. It uses the opposite
    condition to the one at the bottom, because it leaves when the loop would
    not run.
  - One `s32` in and an `s32` out - a running total that adds the argument
    itself, then steps the argument down by one until it stops being positive.
symbol: func_0816f3d4
---

# Reading a loop from its back-edge

A loop in Thumb is three pieces of straight-line code stitched together by one
backward branch. There is no loop instruction and no marker in the listing that
says a loop starts here. The only structural clue is a branch whose destination
address is *lower* than its own address, and that branch is where you start
reading.

Here is a function that grinds a value down by a step it is handed, charging
five a time, until the value falls under 100:

```asm
0        mov       r2, #0
2        cmp       r0, #99
4        ble       14 ~>
6      ~>sub       r0, r1
8        add       r2, #5
10       cmp       r0, #99
12       bgt       6 ~>
14     ~>mov       r0, r2
16       bx        lr
```

Address 12 is the back-edge: `bgt 6`, jumping up. So the loop top is 6, and the
body is everything from 6 to 12 — a subtract and an add. Address 14 is the
first instruction after the loop, and it is the destination of the *forward*
branch at 4. That forward branch is the entry test, or guard, and it exists
because the loop might have to run zero times.

Notice the two tests are the same condition spelled opposite ways. The bottom
test is written straight: stay in the loop while the value is still greater than
99. The guard is written inverted: skip the loop if it is not.
Whenever you see a `bXX` out to the exit label followed later by the inverse
`bYY` back to the top, those two branches came from one C condition.

The compare is against 99 rather than 100 because gcc rewrites a signed `>=`
against a constant into a `>` against one less, and a `<` into a `<=` the
same way. A constant in a listing is frequently one away from the constant in
the source for exactly that reason.

`mov r2, #0` at address 0 sits above the guard, so it runs whether or not the
loop does. Anything above the guard is initialization.

Your target has the same three pieces in the same order. Read the back-edge
first, work out what the body does to each register, and then decide what the
guard is testing.

## Your task

Write `func_0816f3d4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0816f3d4(s32 n) {
    s32 t = 0;
    while (n > 0) {
        t += n;
        n--;
    }
    return t;
}
```
