---
id: e5c28776-5592-4699-a9e0-335d99d32662
slug: loops-while-guard
title: "while Means Guard"
difficulty: 3
concepts:
  - loops
  - while
  - branch-likely
  - delay-slots
symbol: func_80170a1c
hints:
  - "Guard at the top, likely back-edge at the bottom, and the cloned accumulate reads the loop variable — three lessons stacked in one listing."
  - "The counter is the argument itself, stepping down — the accumulator adds it each trip. Mind which of the two the final copy returns."
---

# The branch that runs zero times

A `do`/`while` promises at least one trip. A `while` promises nothing — so
before its rotated body, IDO plants a **guard**: the loop condition flipped,
jumping past everything. You met the shape in the anatomy lesson; now read
it knowing everything the last two lessons taught. Here's `shrink`, which
counts how many right-shifts empty a positive number:

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

Read the guard as part of the loop, not as an `if`: **`blez` guarding a
`bgtz` back-edge is one `while (x > 0)`**, the same condition tested twice —
flipped on the way in, straight on the way around. The giveaway that these
branches belong together: the guard's target (`0x18`) is the first line
*after* the back-edge's slot.

Two familiar friends in the frame: the guard's delay slot doing the `c = 0`
setup, and `t6` holding the shifted value before it's committed back to
`a0` — the test at `10` reads `t6` because it's the same value, one line
fresher.

The target is a `while` loop too, but its body *accumulates the counter
itself* — which, as the last lesson taught you, forces the back-edge into
its likely form with a cloned accumulate. Expect all three pieces: guard,
`bgtzl`, twin `addu`s. The C is still just a plain `while` with a two-line
body.

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
