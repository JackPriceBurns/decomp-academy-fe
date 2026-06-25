---
id: loops-inversions
title: "Capstone: Counting Pairs in a Grid Scan"
difficulty: 4
concepts:
  - nested-loops
  - triangular
  - arrays
  - conditional-update
  - capstone
symbol: inv
hints:
  - Two indexed loads per inner pass — one for the outer element, one for the inner
    — feed a single compare.
  - The inner loop starts at `i + 1`, not 0 (`addi r7, r6, 1`), so each pair is
    visited once; this is the triangular shape from the previous lesson with a
    shifted start.
  - The accumulator only advances on the `ble-` *not-taken* path — that conditional
    `addi` is the `if` body.
---

# Everything at once: a triangular pair scan

This capstone folds the whole chapter into one function: a **nested** loop whose
inner bound follows the outer index (a triangle), which **loads two array
elements** per pass, **compares** them, and **conditionally** bumps a counter.
Every piece appeared earlier — here they stack.

Consider `gmax(a, rows, cols)`, which returns the largest element of a row-major
grid. It is a full rectangular nest (inner runs the whole `cols` each pass), it
addresses memory with the flattened `i * cols + j` formula, and it updates its
running result only when a candidate beats it:

```asm
lwz  r8, 0(r3)      # m = a[0]  (seed)
li   r6, 0          # i = 0
b    otest
obody:
li   r7, 0          # j = 0
b    itest
ibody:
mullw r0, r6, r5    # i * cols
add  r0, r7, r0     # + j
slwi r0, r0, 2      # * 4
lwzx r0, r3, r0     # load a[i*cols + j]
cmpw r0, r8         # candidate vs running max
ble- iskip          # not greater -> keep m
mullw r0, r6, r5    # recompute index for the store
add  r0, r7, r0
slwi r0, r0, 2
lwzx r8, r3, r0     # m = a[i*cols + j]
iskip:
addi r7, r7, 1      # j++
itest:
cmpw r7, r5         # j < cols ?
blt+ ibody
addi r6, r6, 1      # i++
otest:
cmpw r6, r4         # i < rows ?
blt+ obody
mr   r3, r8
blr
```

Read it as layers: the two stacked skeletons are the nest, the `mullw`/`add`/
`slwi`/`lwzx` is the 2-D load, the `cmpw`+`ble-` is the test, and the
conditionally-reached `lwzx r8` is the update. Strip any one layer and you are
back to an earlier lesson.

Your `inv` differs in three ways from this example, each one a layer you have
already met:

- It scans a **flat** `int` array of length `n` (one index each, `a[i]` and
  `a[j]` — `slwi`+`lwzx`, no `mullw` for the address).
- The inner loop is **triangular with a shifted start**: it begins at `j = i + 1`
  rather than 0 (look for the `addi` that seeds the inner counter from the outer
  one), so every unordered pair is visited exactly once.
- The conditional updates a simple **counter** (`addi`), not a stored value.

Trace the compare between the two loaded elements and which way the `ble-` falls
to recover the condition being counted.

## Your task

Write `inv`, returning the number of pairs `(i, j)` with `i < j < n` and
`a[i] > a[j]` (the inversion count of `a`).

<!-- starter -->
```c
int inv(int *a, int n) {
    int i, j, c = 0;
    // count pairs i < j with a[i] > a[j]
    return c;
}
```

<!-- solution -->
```c
int inv(int *a, int n) {
    int i, j, c = 0;
    for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
            if (a[i] > a[j]) c++;
        }
    }
    return c;
}
```
