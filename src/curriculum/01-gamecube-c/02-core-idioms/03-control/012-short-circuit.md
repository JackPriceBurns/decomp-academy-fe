---
id: 0a9f96b1-c2f9-5af8-b7b8-445e9c95df2f
slug: control-short-circuit
title: Short-Circuit && and ||
difficulty: 3
concepts:
  - boolean
  - short-circuit
  - branch
  - logic
symbol: func_802a7e58
hints:
  - "`&&` short-circuits: a failing first test skips the second compare."
  - Expect two `cmpwi ..., 0` with a `ble-` after each jumping to the false exit.
---

# Two compares, lazily evaluated

`&&` and `||` are lazy in C — the right-hand operand runs only if the left one
left the answer open. In asm that shows up as *two compares with branches
wedged between them*.

Take `&&` first. The instant a test fails, control bails to the false exit and
the right-hand operand never executes. In the listing below, `r3` is checked
and a `bge-` to `.false` fires the moment it isn't negative, so `r4` never gets
looked at once the first half has lost.

```asm
# both_negative(int a, int b): return 1 if a < 0 && b < 0
cmpwi r3, 0
bge-  .false     # a >= 0 -> whole && is false, skip the b test
cmpwi r4, 0
bge-  .false     # b >= 0 -> false
li    r3, 1      # both passed
blr
.false:
li    r3, 0
blr
```

`||` flips that around. Now a *passing* test is the one that jumps, straight to
the true exit. Below, a single argument hitting 10 declares the whole thing
true via a `bge-` to `.true`, leaving the second `cmpwi` unreached.

```asm
# either_large(int a, int b): return 1 if a >= 10 || b >= 10
cmpwi r3, 10
bge-  .true      # a >= 10 -> short-circuit, the || is already true
cmpwi r4, 10
blt-  .false     # last test still gates: b < 10 -> false
.true:
li    r3, 1
blr
.false:
li    r3, 0
blr
```

The tail has a wrinkle: only the leading operand can shortcut to true. The
final compare gets none — it falls through onto the true path and diverts to
false only on failure. Count the `cmpwi`s, follow the branch leaving each, and
the `&&`/`||` behind them is yours to rebuild.

## Your task

Write `func_802a7e58` to reproduce the target assembly.

<!-- solution -->
```c
int func_802a7e58(int a, int b) {
    if (a > 0 && b > 0) return 1;
    return 0;
}
```
