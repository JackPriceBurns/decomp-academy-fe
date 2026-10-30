---
id: 87ecde78-2b8f-49b1-ad1a-5f69d8bed5e8
slug: opt-level-o2g0
title: "-O2 Without Debug Support"
difficulty: 3
concepts:
  - optimizer
  - debug-level
  - calls
  - scheduling
opt: "O2,g0"
symbol: func_801fb378
hints:
  - "The value stored in the call's delay slot comes back as one operand of the multiply. The call's result is the other operand."
  - "There is no padding after `mflo` here, because the window rule does not apply at `-g0`. Don't try to change that. The one-line C produces this exact tail."
---

# The fingerprints go away at -g0

Every pattern this chapter has covered (homing reloads, cautious slots, padded
windows) came from `-g3`. Remove the debug support, and the same optimizer
writes very different code. Here is `addAfter(x)`, returning `work(x) + x`, at
**`-O2 -g0`**. This is the listing from this chapter's first lesson, and now
you will read it closely:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    work
sw     a0, 24(sp)     # save x: the STORE goes in the call's delay slot
lw     ra, 20(sp)
lw     t6, 24(sp)     # x back; no pointless a0 reload ever happened
addiu  sp, sp, 24     # frame already closed…
jr     ra
addu   v0, v0, t6     # …and the real work goes in the return slot
```

Everything `-g3` refused to do, `-g0` does. The argument store goes in the
`jal`'s delay slot, nothing reloads `a0` before the call, and the actual
addition (the whole purpose of the function) runs in the `jr ra` delay slot.
Instruction order is also less fixed. With no debugger to satisfy, the epilogue
loads and the frame close can come in whatever order schedules best. So expect
small changes in order, instead of the fixed `-g3` templates.

This matters because real projects use different build flags for different
files. The first question to ask about an unmatched function is *which settings
was this built with?* A filled return slot, or an `mflo` with no padding right
before `jr`, answers it straight away: this file was not built with `-g3`.

The grader compiles this exercise at `-O2 -g0`. The target calls an extern
function and combines the result with a value saved before the call. Read the
tail carefully, including where the frame closes compared with the math.

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
