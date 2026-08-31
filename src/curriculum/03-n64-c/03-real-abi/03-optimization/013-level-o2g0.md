---
id: 87ecde78-2b8f-49b1-ad1a-5f69d8bed5e8
slug: opt-level-o2g0
title: "Full Speed: -O2 Without the Debugger"
difficulty: 3
concepts:
  - optimizer
  - debug-level
  - calls
  - scheduling
opt: "O2,g0"
symbol: func_801fb378
hints:
  - "The value stored in the call's delay slot comes back as one operand of the multiply; the call's result is the other."
  - "No padding after `mflo` here — at `-g0` the window rule is gone. Don't fight it; the one-line C produces this exact tail."
---

# The fingerprints wash off

Every tic this chapter has cataloged — homing reloads, timid slots, padded
windows — came from `-g3`. Strip the debug support and the same optimizer
writes strikingly different code. Here's `addAfter(x)`, returning
`work(x) + x`, at **`-O2 -g0`** — the listing from this chapter's opening
lesson, now yours to read closely:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    work
sw     a0, 24(sp)     # park x — the STORE rides the call's slot
lw     ra, 20(sp)
lw     t6, 24(sp)     # x back; no pointless a0 reload ever happened
addiu  sp, sp, 24     # frame already closed…
jr     ra
addu   v0, v0, t6     # …and the real work rides the return slot
```

Everything `-g3` refused to do, `-g0` does gladly: the argument store rides
the `jal`'s delay slot, nothing reloads `a0` before the call, and the actual
addition — the entire point of the function — executes in the `jr ra` shadow.
Even instruction order gets looser: with no debugger to satisfy, the epilogue
loads and the frame-close shuffle into whatever order schedules best, so
expect small permutations rather than the rigid `-g3` templates.

Why does this matter? Real projects mix build flags per file, and the first
question you ask of an unmatched function is *which dialect is this?* A filled
return slot or a naked `mflo` right before `jr` answers it instantly: this
file was not built with `-g3`.

The grader compiles this exercise at `-O2 -g0`. The target calls an extern
and combines the result with the original argument — read the tail carefully,
including where the frame closes relative to the math.

## Your task

`extern s32 helper(s32 x);` is declared for you. Write `func_801fb378` to
reproduce the target assembly.

<!-- solution -->
```c
s32 func_801fb378(s32 n) {
    return helper(n) * n;
}
```

<!-- context -->
```c
extern s32 helper(s32 x);
```
