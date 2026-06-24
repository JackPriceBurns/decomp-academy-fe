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
`bdnz`, and then the short tail loop that handles the leftover `0..7` elements
one at a time. It's in the tail loop where the strength-reduced increment is
cleanest to read.

Consider `score(int *dst, int n)` — a similar loop that writes `i * 8` into
each slot. Its tail loop looks like this:

```asm
L:
  stw   r6, 0(r3)     # store the running product
  addi  r6, r6, 8     # product += 8  (was i*8, now just +8)
  addi  r3, r3, 4     # dst pointer also strength-reduced (+= 4)
  bdnz+ L
```

There is no `mulli` in that loop body at all — both the accumulated value and
the address became cheap induction variables incremented by a constant.
When you see a loop bumping a register by a fixed stride with no multiply in
sight, that's strength reduction, and the original C almost certainly used a
multiply or array index that *looked* expensive. The constant added each
iteration tells you the original stride; match it to the register increment
you see in the target asm and you can work backward to the source expression.

## Your task

Write `fill(int *dst, int n)` to reproduce the assembly above. Use the
natural loop-and-multiply form; let `-O4,p` handle the reduction.

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
