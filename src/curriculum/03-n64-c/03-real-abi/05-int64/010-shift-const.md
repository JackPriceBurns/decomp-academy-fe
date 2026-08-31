---
id: 31902e29-c658-4624-aec8-b19224c59ace
slug: int64-shift-const
title: "Millicode: Shifting by Calling"
difficulty: 3
concepts:
  - int64
  - shifts
  - millicode
  - calls
symbol: func_800640b8
hints:
  - "The helper's name gives the direction and signedness; the delay-slot `addiu` gives the count."
  - "Nothing after the call touches `v0` or `v1` — your C is a single shift expression, returned directly."
---

# The compiler phones a friend

Some 64-bit operations are too awkward to inline, and this compiler's answer
is to **call a tiny library routine** instead — so-called *millicode*. The
first family you'll meet: shifts. Here's `shiftUp(x)`, which returns an
`s64` shifted left by 4:

```asm
addiu  sp, sp, -24     # a frame? for a shift? yes — a call is coming
sw     ra, 20(sp)
sw     a0, 24(sp)      # x homes above the new frame…
sw     a1, 28(sp)
lw     a0, 24(sp)      # …and reloads right back where it was
lw     a1, 28(sp)
addiu  a2, zero, 0     # 2nd argument: the count, itself a 64-bit pair — high 0…
jal    __ll_lshift     # the shift, performed by a helper
addiu  a3, zero, 4     # (slot) …low word: shift by 4
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

Everything here is ABI you already own, just wearing a strange hat:

- **The function stops being a leaf.** One shift in C, and suddenly there's
  the minimal `-24` frame, `ra` at 20, the works. (The argument homes moved
  to 24/28 — those slots belong to the *caller's* frame, which now sits 24
  bytes up.)
- **The helper is an ordinary callee.** `x` goes in `a0`:`a1`; the shift
  count rides `a2`:`a3` as a full 64-bit pair, so a constant count becomes
  two `addiu`s — high word zero, low word the count, the latter tucked into
  the `jal`'s delay slot.
- **The result needs no touch-up.** The helper returns in `v0`:`v1`, which
  is exactly where this function's own return belongs. After the call:
  epilogue, nothing else.

Three helpers cover the family, and the name in the `jal` tells you which
shift you're looking at: `__ll_lshift` for `<<`, `__ll_rshift` for a
*signed* right shift, `__ull_rshift` for an *unsigned* one. The store/reload
comedy and the frame come free; your C is one operator and one count.

The target calls a different member of the family with a different count.

## Your task

Write `func_800640b8` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_800640b8(s64 x) {
    return x >> 8;
}
```
