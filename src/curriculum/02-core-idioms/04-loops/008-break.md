---
id: loops-break
title: Breaking Out Early
difficulty: 3
concepts:
  - break
  - early-exit
  - linear-search
symbol: find
hints:
  - A plain counted `for` with `if (a[i] == k) break;` inside.
  - When `k` is found, `break` leaves the loop with `i` holding the index.
  - If the loop finishes normally `i == n`, which is the not-found answer.
---

# Two ways out of one loop

A `break` gives a loop a *second* exit. This linear search runs a counted loop
(so MWCC still uses `mtctr`/`bdnz` for the normal termination) but adds an inner
`beq-` that jumps straight out the moment it finds `k`. Both exits land on the
same `mr r3, r6` that returns the index `i`:

```asm
li   r6, 0          # index = 0
mtctr r4            # CTR = n
cmpwi r4, 0
ble- done           # n <= 0: skip loop entirely
body:
lwz  r0, 0(r3)      # load current element
cmpw r5, r0         # test condition
beq- done           # early exit
addi r3, r3, 4      # advance pointer
addi r6, r6, 1      # increment index
bdnz+ body          # otherwise keep counting
done:
mr   r3, r6         # return index
blr
```

When you see a loop with a CTR-driven `bdnz` *and* an extra conditional branch
out of the middle, that middle branch is your `break`. If `k` is never found the
loop falls through normally with `i == n`.

## Your task

Write `find`, returning the index of the first element of `a` equal to `k`, or
`n` if there is none.

<!-- starter -->
```c
int find(int *a, int n, int k) {
    int i;  /* the for loop you write below sets i; it holds the answer */
    // return the first index where a[i] == k, else n
    return i;
}
```

<!-- solution -->
```c
int find(int *a, int n, int k) {
    int i;
    for (i = 0; i < n; i++) {
        if (a[i] == k) break;
    }
    return i;
}
```
