---
id: optimization-peephole-merge
title: "The Peephole Optimizer: Dot-Form Merging"
difficulty: 3
concepts:
  - peephole
  - dot-form
  - condition-register
symbol: pick
hints:
  - Compute `y = x & 0xFF` into a named local so it's reused.
  - "Use the ternary `y ? a + y : b` so the masked value both feeds the test and
    is added."
  - Because `y` is tested against zero, `x & 0xFF` becomes `clrlwi.` with the
    compare merged in.
---

# A compare that disappears into the instruction before it

After scheduling, a separate **peephole** pass scans short windows of
instructions and rewrites them. Its signature trick on PowerPC is **dot-form
merging**.

Most arithmetic/logical instructions have a *recording* variant whose mnemonic
ends in `.` (e.g. `add.`, `and.`, `rlwinm.`). The recording form sets condition
register field `cr0` as a side effect — exactly as if you had compared the
result against zero. So when you mask a value and then test it against zero, the
peephole optimizer folds the `cmpwi ...,0` **into** the masking instruction by
flipping it to its dot form:

```asm
clrlwi. r0, r3, 24   # r0 = x & 0xFF, AND set cr0 from the result
beq-    L            # branch on that cr0 — no separate compare!
add     r5, r4, r0
```

The `.` on `clrlwi.` is the whole story: the comparison against zero was
absorbed. One instruction now does the mask *and* the test. Recognizing a
trailing `.` as "this result also feeds a branch/select" is essential reading
skill — and reproducing it means writing C where the masked value is reused.

## Your task

Write `pick(int x, int a, int b)`: let `y = x & 0xFF`; return `a + y` when `y`
is non-zero, otherwise `b`. The optimizer will merge the mask and the test into
a single `clrlwi.`.

<!-- starter -->
```c
int pick(int x, int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int pick(int x, int a, int b) {
    int y = x & 0xFF;
    return y ? a + y : b;
}
```
