---
id: a07d24bc-7d0e-45be-a14a-a5fed9d43c05
slug: adv-offset-table
title: Tables That Don't Start at Zero
difficulty: 3
concepts:
  - switch
  - jump-table
  - control-flow
symbol: func_8001f490
hints:
  - "The `addiu`'s constant is negative. What must the original case numbers have been for the slid range to start at zero?"
  - "Count cases from the `sltiu`, then read each body's return constant in order from the first slid case upward."
---

# Slide first, then look up

A jump table wants indexes starting at 0, but nothing says your cases start
there. When they run, say, 20 through 25, IDO adds one instruction and
carries on. Here's `slotFee(n)`, which prices slots 20–25:

```asm
 0:  addiu  t6, a0, -20          # slide the range: case 20 becomes index 0
 4:  sltiu  at, t6, 6            # bounds-check the SLID value: 6 cases
 8:  beqz   at, 0x58
 c:  addiu  v0, zero, -1         #   default, preloaded
10:  sll    t6, t6, 2            # the slid value indexes the table
14:  lui    at, %hi(.rodata)
18:  addu   at, at, t6
1c:  lw     t6, %lo(.rodata)(at)
20:  jr     t6
24:  nop
28:  jr     ra                   # case 20:
2c:  addiu  v0, zero, 5
30:  jr     ra                   # case 21:
34:  addiu  v0, zero, 10
38:  jr     ra                   # case 22:
3c:  addiu  v0, zero, 15
40:  jr     ra                   # case 23:
44:  addiu  v0, zero, 20
48:  jr     ra                   # case 24:
4c:  addiu  v0, zero, 25
50:  jr     ra                   # case 25:
54:  addiu  v0, zero, 30
58:  jr     ra
5c:  nop
```

One new line — `addiu t6, a0, -20` — and everything after is the machinery
you already know, running on the *slid* value. Recovering the real case
numbers is arithmetic: the slide is −20 and the `sltiu` allows 6 values, so
the cases are 20 through 25. Everything in the C stays in original numbering;
only the assembly does the sliding.

Two details to keep straight:

- **The slide and the bounds check compose.** `n < 20` wraps around to a huge
  unsigned value after the subtraction, so the single `sltiu` still rejects
  both too-small and too-large.
- **Body order is slid-index order** — which is just case order. First body
  after the dispatcher is the lowest case.

The target slides by a different amount and holds a different number of
cases. Do the arithmetic before writing any C.

## Your task

Write `func_8001f490` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8001f490(s32 lvl) {
    switch (lvl) {
    case 10:
        return 1;
    case 11:
        return 2;
    case 12:
        return 4;
    case 13:
        return 8;
    case 14:
        return 16;
    case 15:
        return 32;
    case 16:
        return 64;
    }
    return 0;
}
```
