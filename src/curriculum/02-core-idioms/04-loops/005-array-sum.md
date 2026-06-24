---
id: loops-array-sum
title: Walking an Array by Index
difficulty: 2
concepts:
  - arrays
  - indexed-load
  - addressing
symbol: sum
hints:
  - "`a` is in r3, `n` is in r4 — take them straight as parameters."
  - "`for (i = 0; i < n; i++) s += a[i];` is the whole function."
  - Indexing `a[i]` becomes `slwi` (scale by 4) followed by `lwzx` (indexed
    load).
---

# `a[i]` means scale, then load

To read `a[i]` where `a` is an `int*`, the address is `a + i*4`. The compiler
scales the index with `slwi r0, rI, 2` (`i * 4`) and then uses the **indexed
load** `lwzx rD, rA, rB`, which loads from `rA + rB` in one instruction.

Here is `count_pos(int *a, int n)` — it counts how many elements of `a` are
greater than zero. Study how the `slwi`+`lwzx` pair computes each element
address, and how the result drives a comparison that conditionally updates the
accumulator:

```asm
li   r6, 0          # c = 0
li   r5, 0          # i = 0
b    test
body:
slwi r0, r5, 2      # i * 4
lwzx r0, r3, r0     # load a[i]  (from a + i*4)
cmpwi r0, 0
ble- .skip          # a[i] <= 0 -> don't count it
addi r6, r6, 1      # c++
.skip:
addi r5, r5, 1      # i++
test:
cmpw r5, r4         # i < n ?
blt+ body
mr   r3, r6
blr
```

The array pointer `a` arrives in `r3` and the length `n` in `r4`. For `sum` the
body is simpler — there is no branch inside the loop, just an `add` that
accumulates the loaded value directly — but the `slwi`+`lwzx` pair works
exactly the same way.

> `#pragma optimization_level 1` keeps the index-based loop rolled and readable.

## Your task

Write `sum`, returning the sum of the first `n` elements of `a`.

<!-- starter -->
```c
#pragma optimization_level 1
int sum(int *a, int n) {
    int i, s = 0;
    // sum a[0..n-1]
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
int sum(int *a, int n) {
    int i, s = 0;
    for (i = 0; i < n; i++) s += a[i];
    return s;
}
```
