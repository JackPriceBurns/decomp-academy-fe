---
id: b748d155-70e8-4759-b6c2-bcb90cb1c159
slug: loops-counting-up
title: "Counting Up: slt in the Loop Test"
difficulty: 2
concepts:
  - loops
  - do-while
  - slt
  - delay-slots
symbol: func_801d2344
hints:
  - "The accumulator starts at a non-zero value, set by the first `addiu` from `zero`. The immediate in the delay slot is the step on each trip."
  - "Two registers are set up before the loop. The one that `slt` compares against `a0` is the counter. The other one is your result."
---

# When the test needs two registers

In the last lesson, `bgtz` could do the whole test because the comparison
was against zero. When you count *up* toward a limit, the back-edge needs
help. The `slt` family from the control chapter appears here, at the bottom
of the loop. Here is `tally`, which adds 2 to a total `n` times, with an `i`
that counts up:

```c
s32 tally(s32 n) {
    s32 t = 0;
    s32 i = 0;
    do {
        t += 2;
        i++;
    } while (i < n);
    return t;
}
```

```asm
 0:  or    v1, zero, zero  # t = 0
 4:  or    v0, zero, zero  # i = 0
 8:  addiu v0, v0, 1       # ── loop top: i++
 c:  slt   at, v0, a0      # at = (i < n)
10:  bnez  at, 0x8         # true? around again
14:  addiu v1, v1, 2       # (delay slot) t += 2
18:  or    v0, v1, zero    # result: t
1c:  jr    ra
20:  nop
```

The back-edge is now a *pair*. `slt` computes the C condition into `at`, and
`bnez at` loops while it is true. Read the two as one unit: `slt` + `bnez`
means `while (i < n)`, exactly as written. A back-edge is never flipped.

The rest is what you already know. Both locals are set to zero with `or` from
`zero` before the loop, one body operation sits in the delay slot, and the
accumulator is copied to `v0` at the end. Notice that IDO put `i++` at the
*top* and `t += 2` in the slot. Again the order differs from the C, and again
only the number of updates per trip is kept.

One detail of register allocation to remember: `v0` holds `i` during the
loop, and afterwards it is reused for the return value. The compiler reuses a
register as soon as its old job is done. Never assume that one register means
one C variable for a whole function.

The target has the same structure, with one counter and one accumulator. But
the accumulator does not start at zero, and it does not step by 2. Two
immediates in the listing give you both numbers.

## Your task

Write `func_801d2344` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801d2344(s32 n) {
    s32 t = 5;
    s32 i = 0;
    do {
        t += 3;
        i++;
    } while (i < n);
    return t;
}
```
