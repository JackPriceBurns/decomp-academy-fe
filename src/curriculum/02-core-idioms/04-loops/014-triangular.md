---
id: loops-triangular
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

So far every nested loop swept a full rectangle: the inner loop ran the same
number of times on every outer pass. The moment the inner bound *depends on the
outer index*, the iteration space becomes a **triangle** — pass 0 does almost
nothing, the last pass does the most. This single change is the whole lesson, and
it shows up in exactly one place: the inner condition compares against the outer
counter instead of a fixed `n`.

Consider `tcount(n)`, which counts the cells `(i, j)` with `j < i` — the number
of entries strictly below the diagonal of an `n × n` grid:

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

Look hard at the inner test: `cmpw r5, r4` compares `j` (the inner counter)
against `r4`, which is `i` (the outer counter) — **not** `r3`, the bound `n`. That
is the entire signature of a triangular nest. On the first outer pass `i == 0`,
so the inner loop runs zero times; by the last pass it runs `n - 1` times. When
the inner `cmpw` reads the *outer* induction variable, the inner `for` was bounded
by the outer index.

Your `tri` has the identical control flow — the same `j < i` inner bound — but the
body accumulates the inner counter `j` itself rather than a flat `+1`. Read what
the inner `body` adds to the running total and write that.

> `#pragma optimization_level 1` keeps both loops rolled.

## Your task

Write `tri`, returning the sum of `j` over all pairs with `0 <= j < i < n`.

<!-- starter -->
```c
#pragma optimization_level 1
int tri(int n) {
    int i, j, s = 0;
    // sum j over every pair with j < i < n
    return s;
}
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
