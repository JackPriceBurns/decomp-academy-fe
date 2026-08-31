---
id: 835e2bb0-9081-4c1d-a9a4-3ebcdc72e8fc
slug: pointers-swap
title: "The Swap"
difficulty: 3
concepts:
  - pointers
  - stores
  - scheduling
symbol: func_800d78ac
hints:
  - "Two loads then two stores, criss-crossed between the two pointer arguments. The temporary variable exists only as a register."
  - "Note which pointer gets loaded first in the target and write the plain three-line swap; IDO handles the ordering itself."
---

# Two reads, two writes, zero temps in memory

The classic swap needs a temporary in C — you can't overwrite the
first value before saving it. In the compiled output that temporary is
invisible: it lives its entire life as a register. Here's `swap_ends`,
exchanging the first and last words of a little array:

```c
void swap_ends(s32 *a) {
    s32 t;

    t = a[0];
    a[0] = a[3];
    a[3] = t;
}
```

```asm
lw    v0, 0(a0)     # t = a[0]
lw    t6, 12(a0)    #     a[3], loaded before anything is stored
sw    v0, 12(a0)    # a[3] = t
sw    t6, 0(a0)     # a[0] = the saved a[3]
jr    ra
nop
```

The shape to memorize: **both loads first, then both stores, with the
offsets crossed** — what came from `0` goes to `12`, what came from
`12` goes to `0`. IDO hoists the second load above the first store so
the loads' latency overlaps; your C stays the naive
save-copy-restore three-liner and the compiler produces this exact
schedule.

Also worth noticing: three C statements, four instructions, and neither
count matches the other. By now that should feel normal — you're
matching *dataflow*, not statement-for-statement.

The target swaps through **two separate pointers** instead of two slots
of one array — the criss-cross runs between `a0`'s pointee and `a1`'s
pointee, all at offset 0. Watch which pointer's value gets loaded first
and let your C be ordinary.

## Your task

Write `func_800d78ac` to reproduce the target assembly.

<!-- solution -->
```c
void func_800d78ac(s32 *x, s32 *y) {
    s32 t;

    t = *x;
    *x = *y;
    *y = t;
}
```
