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
  - "One address computation serves two loads. The offsets 0 and 4 tell you which two elements are read."
  - "The C uses the array twice, at the index and at one past it. The two values are combined by the operation that the final `addu` performs."
---

# arr[i + 1] does not add one

When an index is a variable plus a constant, as in `a[i + 1]`, the compiler
does not compute `i + 1`. It computes the address of `a[i]` with the usual
trio. Then it puts the *constant* part in the offset field of the load, which
is where constant indexes always go:

```c
s32 next_of(s32 *a, s32 i) {
    return a[i + 1];
}
```

```asm
sll   t6, a1, 2     # i * 4
addu  t7, a0, t6    # &a[i]
lw    v0, 4(t7)     # a[i + 1]: the +1 became offset 4
jr    ra
nop
```

The two parts of the index went to different places. The variable part went
into the `sll`/`addu`, and the constant part (scaled by the stride) went into
the offset. So a trio whose load has a *non-zero* offset means `a[i + k]`,
with `k = offset ÷ stride`.

This is useful when code reads neighboring elements. The address of `a[i]` is
computed **once**, and each neighbor is a different offset from the same
register. You get one `sll`, one `addu`, and then one load for each element.
When you see several loads that share one computed base register, count the
offsets. Each offset is a separate element, even though there is only one
address computation.

The target does exactly this: one address computation, two loads from it, and
one operation that combines them. Note which offsets appear before you write
the C.

## Your task

Write `func_8006d378` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8006d378(s32 *a, s32 i) {
    return a[i] + a[i + 1];
}
```
