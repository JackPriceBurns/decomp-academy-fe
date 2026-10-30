---
id: 58673dcb-2903-45bd-9e57-60b76645763e
slug: gba-control-capstone-state
title: "Capstone: A State Machine"
difficulty: 5
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_0816ac60
hints:
  - "Three case arms meet at the `cmp r1, #120` at address 40, and two branches
    in the tree jump past it to 46. The arms that meet there left the switch and
    continued. The path that skips it left the function."
  - The guard at the top has an arm of its own, a `mov` and a `b`. So the value
    it returns is a constant. A guard that returns an unchanged argument would
    need no arm.
  - There are two `s32` arguments and an `s32` result. A negative second
    argument is rejected at the start. The first argument selects between
    adding eight, subtracting eight and tripling. For any other first argument,
    the function returns the second one immediately, unchanged. The three arms
    that continue are capped at 120.
---

# Where each arm goes when the switch is over

This function uses everything from this chapter. The part that needs the most
careful reading is what each case arm does when it finishes.

A case that ends in `return` leaves the function. A case that ends in `break`
leaves the switch and continues into the code that follows it. In a listing the
two look the same: both are a `b` to a forward address. The only way to tell
them apart is to notice that they go to *different* forward addresses.

Here is a function where every arm returns:

```asm
0        cmp       r1, #99
2        ble       6 ~>
4        mov       r1, #99
6      ~>cmp       r0, #1
8        beq       30 ~>
10       cmp       r0, #1
12       bgt       20 ~>
14       cmp       r0, #0
16       beq       26 ~>
18       b         38 ~>
20     ~>cmp       r0, #2
22       beq       34 ~>
24       b         38 ~>
26     ~>mov       r0, r1
28       b         40 ~>
30     ~>add       r0, r1, #1
32       b         40 ~>
34     ~>neg       r0, r1
36       b         40 ~>
38     ~>mov       r0, #0
40     ~>bx        lr
```

There is a ceiling clamp at 0 through 4, the compare tree at 6 through 24, and
four bodies. Three of the bodies branch to 40, which is the `bx lr`, and the
default at 38 falls straight into it. Every arm has the same destination, so
there is no code after the switch. The clamp had to run before the switch,
because there is nowhere after it for the clamp to go.

Your target arranges the same three parts differently. This time the clamp
comes after the switch, and the case bodies below the tree have two forward
destinations instead of one. Some land on the clamp's compare, and one jumps
over it. Work out what that difference tells you about how each arm left the
switch.

The guard is the other thing to check. An early return of a value that is
already in `r0` needs only a single branch, as in the guard lesson. An early
return of a constant has to build the constant and then jump to the exit. Count
the instructions in the guard, and you will know which kind it is before you
read anything else.

Work in this order: the guard first, then the tree's case labels, then each
body, and then where each body goes.

## Your task

Write `func_0816ac60` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0816ac60(s32 state, s32 v) {
    if (v < 0) return 0;
    switch (state) {
        case 0: v += 8; break;
        case 1: v -= 8; break;
        case 2: v *= 3; break;
        default: return v;
    }
    if (v > 120) v = 120;
    return v;
}
```
