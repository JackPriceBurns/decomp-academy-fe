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
  - "Three case arms converge on the `cmp r1, #120` at address 40, and two
    branches in the tree jump past it to 46. The arms that converge left the
    switch and carried on; the path that skips it left the function."
  - The guard at the top has an arm of its own, a `mov` and a `b`, which means
    the value it hands back is a constant rather than an untouched argument.
  - Two `s32` arguments and an `s32` result. A negative second argument is
    rejected up front; the first selects between adding eight, subtracting eight
    and tripling; anything else leaves immediately with the value as it stands;
    and the three arms that carry on are capped at 120.
---

# Where each arm goes when the switch is over

Everything in this chapter shows up in one function here, and the piece that
takes the most reading is not the switch itself. It is what each case arm does
when it finishes.

A case that ends in `return` leaves the function. A case that ends in `break`
falls out of the switch and into whatever code follows it. In a listing those
two look identical — both are a `b` to a forward address — and the only way to
tell them apart is to notice that they go to *different* forward addresses.

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

A ceiling clamp at 0 through 4, the compare tree at 6 through 24, and four
bodies: three of them branch to 40 — the `bx lr` — and the default at 38 falls
straight into it. One destination for every arm means no code after the switch
at all, and the clamp had to run before it because there is nowhere else for it
to go.

Your target arranges the same three ingredients differently. The clamp sits on
the far side of the switch this time, and the case bodies below the tree have
two forward destinations rather than one: some land on the clamp's compare and
one steps over it. Work out what that difference says about how each arm left
the switch.

The guard is the other thing to weigh. A bail-out returning a value that is
already in `r0` costs a single branch, as it did in the guard lesson; a bail-out
returning a constant has to build it and carry it to the exit. Count the
instructions in the guard and you know which kind you are looking at before you
read anything else.

Work outwards: guard first, then the tree's case labels, then each body, then
where each body goes.

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
