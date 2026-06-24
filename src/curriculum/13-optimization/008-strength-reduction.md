---
id: optimization-strength-reduction
title: Strength Reduction in a Loop
difficulty: 4
concepts:
  - strength-reduction
  - loops
  - induction-variable
symbol: fill
hints:
  - A simple `for (i = 0; i < n; i++) dst[i] = i * 12;` is all you write.
  - Let the optimizer reduce it — matching the target requires the natural
    multiply form you'd write by hand.
  - Expect heavy unrolling plus a tail loop that increments by 12 with no
    `mulli`.
---

# A multiply per iteration becomes one add per iteration

Inside a loop, `i * K` where `i` is the loop counter is a textbook target for
**strength reduction**. Instead of recomputing `mulli ..., K` every iteration,
the optimizer keeps a running value that starts at zero and increases by `K`
each pass — turning a multiply into a single add. (At `-O4,p` MWCC also unrolls
the hot path eight-wide, so the full function is large; the *idea* lives in the
remainder loop at the end.)

Don't be alarmed when your output runs to dozens of instructions: MWCC emits a
prologue that picks the eight-wide path when `n` is large, an unrolled body that
stores eight elements per pass — still a `mulli` per element there — under a
`bdnz`, and then the short tail loop below
that handles the leftover `0..7` elements one at a time. It's the tail loop where
the strength-reduced `+= 12` is cleanest, so that's what we show.

For `dst[i] = i * 12`, the tail loop shows the reduced form clearly:

```asm
L:
  stw   r6, 0(r3)     # store the running product
  addi  r6, r6, 12    # product += 12  (was i*12, now just +12)
  addi  r3, r3, 4     # dst pointer also strength-reduced (+= 4)
  bdnz+ L
```

There is no `mulli` in that loop body at all — both the value `i*12` and the
address `&dst[i]` became cheap induction variables incremented by a constant.
When you see a loop bumping a register by a fixed stride with no multiply in
sight, that's strength reduction, and the original C almost certainly used a
multiply or array index that *looked* expensive.

## Your task

Write `fill(int *dst, int n)` that sets `dst[i] = i * 12` for `i` in
`0..n-1`. Write the obvious multiply; `-O4,p` strength-reduces it for you.

<!-- starter -->
```c
void fill(int *dst, int n) {
}
```

<!-- solution -->
```c
void fill(int *dst, int n) {
    int i;
    for (i = 0; i < n; i++)
        dst[i] = i * 12;
}
```
