---
id: control-guard
title: The Guard Clause / Early Return
difficulty: 3
concepts:
  - if
  - early-return
  - branch
  - guard
symbol: safe_div
hints:
  - A guard clause keeps a real branch when the arms do different work.
  - Expect `cmpwi r4, 0`, `bne-`, a `li r3, -1` bailout, then `divw`.
---

# Bailing out before the real work

A **guard clause** checks a precondition and returns early so the rest of the
function can assume it holds. Because the two arms do genuinely different work
(return a constant vs. perform a divide), MWCC keeps a real branch here rather
than going branchless:

```asm
cmpwi r4, 0       # is the divisor zero?
bne-  .body       # no -> skip the guard, go do the work
li    r3, -1      # yes -> return the sentinel
blr
.body:
divw  r3, r3, r4  # safe: b is known non-zero here
blr
```

The guard's body (`li r3, -1`; `blr`) sits inline right after the branch, and
the "real" code follows at the `bne-` target. Spotting a lone compare whose
taken branch jumps *over* a small return block is the fingerprint of an
early-return guard.

## Your task

Write `safe_div`: if `b == 0` return `-1`, otherwise return `a / b`.

<!-- starter -->
```c
int safe_div(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int safe_div(int a, int b) {
    if (b == 0) return -1;
    return a / b;
}
```
