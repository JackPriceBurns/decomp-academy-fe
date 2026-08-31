---
id: 6c7e8d5c-8db3-56ca-be58-e97ce7a98ec1
slug: control-if-else
title: "If / Else: The Compare Feeds a Branch"
difficulty: 2
concepts:
  - if-else
  - comparison
  - branch
symbol: func_8031fa34
hints:
  - Two different return values force a `cmpw` plus a branch.
  - Expect `cmpw`, a speculative `li r3, 20`, then `bnelr-`.
---

# When a comparison drives control flow

Two different return values, one per arm of an `if`/`else` — that's all it
takes to summon your first genuine **compare-and-branch**. The comparison stops
handing you a number. It sets the condition register, and a branch reads that
register to choose a direction.

```asm
cmpw  r3, r4      # compare a and b, set cr0
li    r3, 20      # speculative load of one return value
bnelr-            # conditional return
li    r3, 10      # fall-through: load the other return value
blr
```

Quick warning about `bnelr-`: the trailing `-` is a branch-prediction hint, not
an operand, so peel it off in your head. What's left is worth dwelling on. MWCC
loads `20` speculatively, before the branch knows a thing, betting it'll stick.
And `bnelr` is a conditional return — "branch to link register if not equal" —
a single instruction standing in for the entire else.

Trace it. `cmpw` sets cr0. The first `li` plants a guess. The conditional
return bails on the spot or drops through, and on the drop-through the second
`li` overwrites that guess. Watch the branch mnemonic above all else: where the
early exit fires is what nails each `li` to its arm.

## Your task

Write `func_8031fa34` to reproduce the assembly above.

<!-- solution -->
```c
int func_8031fa34(int a, int b) {
    if (a == b) return 10;
    else return 20;
}
```
