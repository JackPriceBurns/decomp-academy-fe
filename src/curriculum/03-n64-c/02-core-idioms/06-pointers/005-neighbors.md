---
id: e1b4de59-7e1e-45ae-aef1-bd0b1dcba3c8
slug: pointers-neighbors
title: "Neighbors: The Offset Comes Back"
difficulty: 2
concepts:
  - pointers
  - arrays
  - offsets
  - cse
symbol: func_8006d378
hints:
  - "One address computation serves two loads — the offsets 0 and 4 distinguish the two elements being read."
  - "The C mentions the array twice, at the index and one past it, joined by the operation the final `addu` performs."
---

# arr[i + 1] doesn't add one

Mix a variable index with a constant nudge — `a[i + 1]` — and the
compiler doesn't compute `i + 1`. It computes the address of `a[i]` with
the usual trio, then lets the *constant* part ride in the load's offset
field, exactly where constant indexes always go:

```c
s32 next_of(s32 *a, s32 i) {
    return a[i + 1];
}
```

```asm
sll   t6, a1, 2     # i * 4
addu  t7, a0, t6    # &a[i]
lw    v0, 4(t7)     # a[i + 1] — the +1 became offset 4
jr    ra
nop
```

The two halves of the index went to their two homes: variable part into
the `sll`/`addu`, constant part (scaled by the stride) into the offset.
So a trio whose load has a *non-zero* offset means `a[i + k]`, with
`k = offset ÷ stride`.

This pays off the moment code touches neighboring elements. The address
of `a[i]` gets computed **once**, and each neighbor is just a different
offset hanging off the same register — one `sll`, one `addu`, then as
many loads as there are elements involved. When you see several loads
sharing one computed base register, count offsets, not address
computations.

That's precisely the target: one address computation, two loads off it,
one operation joining them. Note which offsets appear before you write
the C.

## Your task

Write `func_8006d378` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8006d378(s32 *a, s32 i) {
    return a[i] + a[i + 1];
}
```
