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
  - "There are two loads, then two stores, crossed over between the two pointer arguments. The temporary variable exists only as a register."
  - "Note which pointer is loaded first in the target, and write the plain three-line swap. IDO handles the ordering itself."
---

# Two reads and two writes, with no temporary in memory

A swap in C needs a temporary variable, because you can't overwrite the first
value before you save it. In the compiled output you can't see that
temporary. It only ever exists in a register. Here is `swap_ends`, which
exchanges the first and last words of a small array:

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

Remember this shape: **both loads first, then both stores, with the offsets
crossed over.** The value from `0` goes to `12`, and the value from `12` goes
to `0`. IDO moves the second load above the first store so that the waits
for the two loads overlap. Your C stays the plain three-line swap (save, copy,
restore), and the compiler produces this exact order.

Notice also that there are three C statements and four instructions, so the
counts don't match. By now that should feel normal. You are matching the
*dataflow*, not one instruction per statement.

The target swaps through **two separate pointers** instead of two slots of
one array. The values cross over between what `a0` points to and what `a1`
points to, all at offset 0. Note which pointer's value is loaded first, and
write ordinary C.

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
