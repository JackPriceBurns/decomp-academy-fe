---
id: loops-grid-sum
title: Nesting Over a 2-D Array
difficulty: 4
concepts:
  - nested-loops
  - arrays
  - row-major
  - indexed-load
symbol: gsum
hints:
  - A row-major 2-D array stored flat is addressed `a[i * cols + j]` — the `mullw`
    computes `i * cols` and an `add` tacks on `j` before the usual scale-and-load.
  - The inner loop runs over `j < cols`; the outer over `i < rows`. The inner
    counter resets to 0 at the top of every outer pass.
  - "`mullw` (row offset) then `add` (column) then `slwi`+`lwzx` is the signature
    of a flattened 2-D access."
---

# A grid in memory is one flat array

Real code rarely nests loops just to multiply counters — it nests them to walk a
**2-D array**. A `rows × cols` grid is almost always stored *flat* in row-major
order: element `(i, j)` lives at flat offset `i * cols + j`. So the address
arithmetic inside the inner body computes that offset, which the compiler builds
with a `mullw` (the row part `i * cols`), an `add` (the column `j`), and then the
familiar `slwi`+`lwzx` to scale by 4 and load.

Consider `gnz(a, rows, cols)`, which counts how many cells of the grid are
non-zero:

```asm
li   r8, 0          # c = 0
li   r6, 0          # i = 0
b    otest
obody:
li   r7, 0          # j = 0  (reset each outer pass)
b    itest
ibody:
mullw r0, r6, r5    # i * cols
add  r0, r7, r0     # + j   ->  flat index
slwi r0, r0, 2      # index * 4
lwzx r0, r3, r0     # load cell (i, j)
cmpwi r0, 0
beq- iskip          # zero -> don't count
addi r8, r8, 1      # c++
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

The two nested skeletons are exactly the ones from the previous lesson; what is
new is the **address computation** in the inner body. Spot the `mullw`/`add` pair
feeding the `slwi`/`lwzx` and you have found a flattened 2-D access. The `cols`
operand of that `mullw` is the row stride — the second dimension of the array.

Your `gsum` uses the same nested skeleton and the same flattened addressing, but
its inner body is *simpler* than this example — no compare, no branch. Read the
target's inner body to see what it does with each element it loads.

> `#pragma optimization_level 1` keeps both loops rolled.

## Your task

Write `gsum`, returning the sum of all `rows * cols` elements of the row-major
grid `a`.

<!-- starter -->
```c
#pragma optimization_level 1
int gsum(int *a, int rows, int cols) {
    int i, j, s = 0;
    // sum every cell of the rows-by-cols grid
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
int gsum(int *a, int rows, int cols) {
    int i, j, s = 0;
    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            s += a[i * cols + j];
        }
    }
    return s;
}
```
