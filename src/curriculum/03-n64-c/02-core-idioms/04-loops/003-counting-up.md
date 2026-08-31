---
id: b748d155-70e8-4759-b6c2-bcb90cb1c159
slug: loops-counting-up
title: "Counting Up: slt Joins the Loop"
difficulty: 2
concepts:
  - loops
  - do-while
  - slt
  - delay-slots
symbol: func_801d2344
hints:
  - "The accumulator starts at a non-zero value — the first `addiu` from `zero` sets it. The slot's immediate is the per-trip step."
  - "Two registers initialize before the loop; the one compared by `slt` against `a0` is the counter, the other is your result."
---

# When the test needs two registers

`bgtz` could carry the whole test last lesson because the comparison was
against zero. Count *up* toward a limit and the back-edge needs help — the
`slt` family you know from the control chapter clocks in, right at the
bottom of the loop. Here's `tally`, which adds 2 to a total, `n` times, with
an `i` counting up:

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

The back-edge is now a *pair*: `slt` computes the C condition into `at`, and
`bnez at` loops while it holds. Read them as one unit — `slt` + `bnez` =
`while (i < n)`, exactly as written, no flipping on a back-edge.

Everything else is the ritual you know: both locals zeroed via `or` from
`zero` before the loop, the body op riding the slot, the accumulator copied
to `v0` at the end. Notice IDO put `i++` at the *top* and the `t += 2` in
the slot — again reordered from the C, again preserving only the per-trip
count.

One register-allocation quirk worth filing: `v0` holds `i` during the loop,
then gets reused to hold the return value after. Registers are recycled the
moment their old job ends — never assume one register means one C variable
for a whole function.

The target is the same skeleton: one counter, one accumulator — but the
accumulator neither starts at zero nor steps by 2. Two immediates in the
listing tell you both numbers.

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
