---
id: 671dd2f1-4c76-5d38-b692-4290852e9542
slug: loops-triangular
title: When the Inner Bound Follows the Outer
difficulty: 4
concepts:
  - nested-loops
  - triangular
  - control-flow
symbol: tri
hints:
  - The inner test compares the inner counter against the *outer* counter, not
    against `n` — so the inner trip count grows as the outer index climbs.
  - The inner loop still resets its counter to 0 each outer pass; only its bound
    changed.
  - The body just accumulates the inner counter; the interesting part is entirely
    in the inner test.
---

# A triangle, not a rectangle

Every nested loop up to now swept a full rectangle, the inner loop running the
same number of times on each outer pass. Let the inner bound *depend on the outer
index*, though, and the iteration space turns into a **triangle**, where pass 0
barely does a thing and the last pass does the most. That one change is the entire
lesson, and it surfaces in a single spot. The inner condition checks against the
outer counter, not a fixed `n`.

Take `tcount(n)`, which counts the cells `(i, j)` where `j < i`, the entries
strictly below the diagonal of an `n × n` grid:

```asm
li   r6, 0          # c = 0
li   r4, 0          # i = 0
b    otest
obody:
li   r5, 0          # j = 0  (reset each outer pass)
b    itest
ibody:
addi r6, r6, 1      # c++
addi r5, r5, 1      # j++
itest:
cmpw r5, r4         # j < i ?   <-- inner bound is the OUTER counter
blt+ ibody
addi r4, r4, 1      # i++
otest:
cmpw r4, r3         # i < n ?
blt+ obody
mr   r3, r6
blr
```

Stare at the inner test. `cmpw r5, r4` pits `j`, the inner counter, against `r4`,
which is `i`, the outer counter, and **not** `r3`, the bound `n`. That alone is the
whole signature of a triangular nest. On the first outer pass `i == 0`, so the
inner loop never runs; by the final pass it runs `n - 1` times. Once the inner
`cmpw` is reading the *outer* induction variable, you know the inner `for` was
bounded by the outer index.

Your `tri` runs the identical control flow, the same `j < i` inner bound, but its
body folds in the inner counter `j` itself instead of a flat `+1`. Read what the
inner `body` adds to the running total and write that.

> `#pragma optimization_level 1` keeps both loops rolled.

## Your task

Write `tri`, returning the sum of `j` over all pairs with `0 <= j < i < n`.

<!-- starter -->
```c
#pragma optimization_level 1
// define tri to match the target
```

<!-- solution -->
```c
#pragma optimization_level 1
int tri(int n) {
    int i, j, s = 0;
    for (i = 0; i < n; i++) {
        for (j = 0; j < i; j++) {
            s += j;
        }
    }
    return s;
}
```
