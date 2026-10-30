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
    condition to the test at the bottom, because it skips the loop when the loop
    should not run.
  - One `s32` in and an `s32` out. It keeps a running total, adding the argument
    to it and then stepping the argument down by one, until the argument is no
    longer positive.
symbol: func_0816f3d4
---

# Reading a loop from its back-edge

In Thumb, a loop is three pieces of straight-line code joined by one backward
branch. There is no loop instruction, and nothing in the listing marks where a
loop starts. The only clue is a branch whose destination address is *lower* than
its own address. This branch is called the back-edge, and it is where you start
reading.

Here is a function that keeps subtracting a step from a value until the value
is under 100. The step is passed in as an argument, and the function adds five
to a total each time:

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

Address 12 is the back-edge: `bgt 6` jumps up. So the loop top is 6, and the
body is everything from 6 to 12, which is a subtract and an add. One pass
through the body is called a trip. Address 14 is the first instruction after the
loop, and it is the destination of the *forward* branch at 4. That forward
branch is the entry test, or guard. It is there because the loop might need to
run zero times.

The two tests check the same condition in opposite directions. The test at the
bottom is written directly: stay in the loop while the value is still greater
than 99. The guard is inverted: skip the loop if the value is not greater
than 99. When you see a `bXX` to the exit label, and later the opposite `bYY`
back to the top, those two branches came from one C condition.

The compare uses 99 and not 100 because gcc rewrites a signed `>=` against a
constant as a `>` against one less. It rewrites a `<` as a `<=` in the same
way. This is why a constant in a listing is often one away from the constant in
the source.

`mov r2, #0` at address 0 is above the guard, so it runs whether or not the loop
runs. Anything above the guard is initialization.

Your target has the same three pieces in the same order. Read the back-edge
first. Next, work out what the body does to each register. Then decide what the
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
