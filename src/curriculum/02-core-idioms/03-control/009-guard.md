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
(return a constant vs. perform a computation), MWCC keeps a real branch here
rather than going branchless:

```asm
cmpwi r4, 0       # test the second argument
bne-  .body       # skip the early-return block if not equal
li    r3, -1      # early-return path
blr
.body:
divw  r3, r3, r4  # main computation
blr
```

Two `blr` instructions is the giveaway: each arm has its own exit. The guard's
body sits inline right after the branch; the "real" code follows at the `bne-`
target. Spotting a lone compare whose *taken* branch jumps *over* a small return
block is the fingerprint of an early-return guard.

To decode this pattern: identify which register is being tested and against what
value; note that `bne-` *skips past* the inline return when the register is
non-zero; and identify what computation runs at the branch target. The sentinel
`li` value and the operation after the branch target are both visible in the
assembly.

## Your task

Write `safe_div`, taking two `int`s, to reproduce the assembly above.

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
