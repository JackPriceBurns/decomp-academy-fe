---
id: e5c28776-5592-4699-a9e0-335d99d32662
slug: loops-while-guard
title: "A while Loop Gets a Guard"
difficulty: 3
concepts:
  - loops
  - while
  - branch-likely
  - delay-slots
symbol: func_80170a1c
hints:
  - "There is a guard at the top and a likely back-edge at the bottom, and the cloned accumulate reads the loop variable. This listing combines three earlier lessons."
  - "The counter is the argument itself, stepping down, and the accumulator adds it on each trip. Check which of the two the final copy returns."
---

# A loop that can run zero times

A `do`/`while` always runs at least once. A `while` might not run at all. So
before its rotated body, IDO adds a **guard**: the loop condition, flipped,
as a branch that jumps past the whole loop. You saw this shape in the
anatomy lesson. Now read it again with what the last two lessons taught you.
Here is `shrink`, which counts how many right shifts it takes to bring a
positive number down to zero:

```c
s32 shrink(s32 x) {
    s32 c = 0;
    while (x > 0) {
        x = x >> 1;
        c++;
    }
    return c;
}
```

```asm
 0:  blez  a0, 0x18       # guard: x <= 0 already? skip the loop
 4:  or    v1, zero, zero # (slot) c = 0
 8:  sra   t6, a0, 1      # ── loop top: x >> 1
 c:  or    a0, t6, zero   # x = the shifted value
10:  bgtz  t6, 0x8        # x > 0? again
14:  addiu v1, v1, 1      # (delay slot) c++
18:  or    v0, v1, zero
1c:  jr    ra
20:  nop
```

Read the guard as part of the loop, and don't turn it into an `if`.
**A `blez` guard in front of a `bgtz` back-edge is one `while (x > 0)`.** It
is the same condition tested twice: flipped on the way in, and as written on
each trip around. You can tell that these branches belong together because
the guard's target (`0x18`) is the first line *after* the back-edge's delay
slot.

Two other details are familiar. The guard's delay slot does the `c = 0`
setup. And `t6` holds the shifted value before it is copied back to `a0`.
The test at `10` reads `t6` because it is the same value, and it is ready one
line earlier.

The target is also a `while` loop, but its body *adds the counter itself to
a total*. As the last lesson showed, that forces the back-edge into its
likely form with a cloned accumulate. Expect to see all three pieces: the
guard, a `bgtzl`, and two identical `addu`s. The C is still a plain `while`
with a two-line body.

## Your task

Write `func_80170a1c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80170a1c(s32 n) {
    s32 t = 0;
    while (n > 0) {
        t += n;
        n--;
    }
    return t;
}
```
