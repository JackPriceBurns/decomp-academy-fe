---
id: 31902e29-c658-4624-aec8-b19224c59ace
slug: int64-shift-const
title: "Millicode: Shifts as Function Calls"
difficulty: 3
concepts:
  - int64
  - shifts
  - millicode
  - calls
symbol: func_800640b8
hints:
  - "The helper's name tells you the direction and signedness. The `addiu` in the delay slot gives the count."
  - "Nothing after the call touches `v0` or `v1`, so your C is a single shift expression that is returned directly."
---

# The compiler calls a helper

Some 64-bit operations are too awkward to inline. For these, this compiler
**calls a small library routine** instead. These routines are called
*millicode*. The first family you will meet is shifts. Here is `shiftUp(x)`,
which returns an `s64` shifted left by 4:

```asm
addiu  sp, sp, -24     # a frame for a shift, because a call is coming
sw     ra, 20(sp)
sw     a0, 24(sp)      # x homes above the new frame…
sw     a1, 28(sp)
lw     a0, 24(sp)      # …and reloads right back where it was
lw     a1, 28(sp)
addiu  a2, zero, 0     # 2nd argument: the count, also a 64-bit pair. High 0…
jal    __ll_lshift     # the shift, performed by a helper
addiu  a3, zero, 4     # (slot) …low word: shift by 4
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

All of this is ABI you already know, used in an unfamiliar way:

- **The function is no longer a leaf.** One shift in C, and now there is the
  minimal `-24` frame, `ra` saved at 20, and everything else that comes with
  a call. (The argument home slots moved to 24/28. Those slots belong to the
  *caller's* frame, which is now 24 bytes up.)
- **The helper is an ordinary callee.** `x` goes in `a0`:`a1`. The shift
  count goes in `a2`:`a3` as a full 64-bit pair, so a constant count becomes
  two `addiu`s: the high word is zero and the low word is the count. The
  second `addiu` is placed in the `jal`'s delay slot.
- **The result needs no extra work.** The helper returns in `v0`:`v1`, which
  is exactly where this function's own return value goes. After the call
  there is only the epilogue.

Three helpers make up the shift family, and the name in the `jal` tells you
which shift you are looking at: `__ll_lshift` for `<<`, `__ll_rshift` for a
*signed* right shift, and `__ull_rshift` for an *unsigned* one. The stores,
reloads and frame come automatically. Your C is one operator and one count.

The target calls a different member of the family with a different count.

## Your task

Write `func_800640b8` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_800640b8(s64 x) {
    return x >> 8;
}
```
