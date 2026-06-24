---
id: control-if-else
title: "If / Else: The Compare Feeds a Branch"
difficulty: 2
concepts:
  - if-else
  - comparison
  - branch
symbol: pick
hints:
  - Two different return values force a `cmpw` plus a branch.
  - Expect `cmpw`, a speculative `li r3, 20`, then `bnelr-`.
---

# When a comparison drives control flow

Returning *different constants* from the two arms of an `if`/`else` is the
first time you'll see a real **compare-and-branch**. The comparison no longer
produces a number — it sets the condition register, and a branch reads it:

```asm
cmpw  r3, r4      # compare a and b, set cr0
li    r3, 20      # speculative load of one return value
bnelr-            # conditional return
li    r3, 10      # fall-through: load the other return value
blr
```

First, that trailing `-` on `bnelr-` is a branch-prediction hint, not an
operand. Two things to notice. MWCC **speculatively loads one constant** before
the branch, and a *conditional return* (`bnelr` — "branch to link register if
not equal") collapses an entire else-arm into one instruction.

To read the pattern: the `cmpw` sets cr0; the first `li` seeds a speculative
result; the conditional `blr`-style branch either exits early or falls through;
the second `li` then applies for the other case. The branch mnemonic tells you
*when* the function exits early, and therefore which `li` belongs to which arm.

## Your task

Write `pick`, taking two `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int pick(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int pick(int a, int b) {
    if (a == b) return 10;
    else return 20;
}
```
