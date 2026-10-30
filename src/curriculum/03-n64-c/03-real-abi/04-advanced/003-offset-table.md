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
  - "The constant in the `addiu` is negative. What must the original case numbers be for the slid range to start at zero?"
  - "Get the number of cases from the `sltiu`. Then read each body's return constant in order, starting from the first slid case."
---

# Slide the range first, then look up

A jump table needs indexes that start at 0, but your cases might start
somewhere else. If they run from 20 to 25, for example, IDO adds one
instruction and then builds the table as usual. Here is `slotFee(n)`, which
prices slots 20 to 25:

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

There is one new line, `addiu t6, a0, -20`. It *slides* the range down so
that it starts at 0. Everything after it is the code you already know,
running on the slid value. To recover the real case numbers, do the
arithmetic: the slide is −20 and the `sltiu` allows 6 values, so the cases
are 20 to 25. Your C keeps the original case numbers. Only the assembly does
the sliding.

Two details to remember:

- **The slide and the bounds check work together.** If `n < 20`, the
  subtraction gives a negative result, which is a very large value when read
  as unsigned. So the single `sltiu` still rejects values that are too small
  and values that are too large.
- **The bodies come in slid-index order**, which is the same as case order.
  The first body after the dispatcher is the lowest case.

The target slides by a different amount and has a different number of cases.
Do the arithmetic before you write any C.

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
