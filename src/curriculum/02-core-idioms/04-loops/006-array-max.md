---
id: loops-array-max
title: Finding the Maximum
difficulty: 3
concepts:
  - arrays
  - ctr-loop
  - conditional-update
symbol: amax
hints:
  - Seed `m = a[0]`, then loop `i` from 1 to `n-1`.
  - "Update conditionally: `if (a[i] > m) m = a[i];` becomes a compare and a
    `mr`."
  - A known trip count makes MWCC use `mtctr` / `bdnz` for the loop.
---

# A known trip count uses the count register

This loop scans an array keeping track of the best value seen. Because the trip
count is known *before* the loop starts, MWCC loads it into the special
**count register** with `mtctr` and uses `bdnz` ("decrement CTR, branch if
non-zero") as the loop branch — no explicit counter compare needed. The body
is data-dependent (the running result is only updated conditionally), so the
loop stays rolled even at full `-O4,p`:

```asm
addi r0, r4, -1     # trip count = n - 1
addi r5, r3, 4      # pointer past first element
lwz  r3, 0(r3)      # load seed value
mtctr r0            # CTR = n - 1
cmpwi r4, 1
blelr-              # early return when nothing to scan
body:
lwz  r0, 0(r5)      # load candidate
cmpw r0, r3         # compare against running result
ble- skip
mr   r3, r0         # conditional update
skip:
addi r5, r5, 4      # advance pointer
bdnz+ body          # CTR--, loop while non-zero
blr
```

Two idioms to bank: `mtctr`/`bdnz` is *the* signature of a counted loop with a
precomputed trip count, and `blelr-` is "compare-then-return" fused into the
early exit. Keep the `mtctr`/`bdnz` pair in mind — it returns in the break
lesson, where the same count register drives a loop that also has an early exit.

## Your task

Write `amax`, returning the largest of the `n` elements of `a` (assume `n >= 1`).

<!-- starter -->
```c
int amax(int *a, int n) {
    int i, m = a[0];
    // keep the largest element
    return m;
}
```

<!-- solution -->
```c
int amax(int *a, int n) {
    int i, m = a[0];
    for (i = 1; i < n; i++) {
        if (a[i] > m) m = a[i];
    }
    return m;
}
```
