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
cmpw  r3, r4      # compare a against b, set cr0
li    r3, 20      # assume the else value first
bnelr-            # if a != b, return now with 20
li    r3, 10      # otherwise overwrite with the then value
blr
```

First, that trailing `-` on `bnelr-` is a branch-prediction hint, not an
operand. Then two things to notice. MWCC **speculatively loads the else value**
(`20`) before the branch, so the equal case is the one that falls through and
reloads. And `bnelr` is a *conditional return* — "branch to link register if
not equal" — collapsing an entire else-arm into one instruction.

## Your task

Write `pick`: return `10` when `a == b`, otherwise `20`.

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
