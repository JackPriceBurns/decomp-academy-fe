---
id: 79dc67a8-7935-44db-92c0-53101dc7245f
slug: finale-grand-capstone
title: "Grand Capstone: One Real Function"
difficulty: 5
concepts:
  - globals
  - calls
  - hi-lo
  - branches
  - capstone
symbol: func_8027719c
hints:
  - "The low word of `multu` works for signed multiplies too. Its operands are
    the parameter and the newly incremented value that is about to be stored."
  - "The `slti` compares against 10, and the `bnez` *skips* the call, so the call runs on the opposite condition. Both globals are stored before the branch runs."
---

# The whole tier in one function

This is the last exercise of the tier. It is shaped like a function you would
really find in a shipped game. It has globals, a frame, a conditional call,
and optimizer scheduling spread across all of it. First, here is a worked
example of a similar function, `fireShot(cost)`, which spends ammo and plays
a sound when the ammo runs out:

```asm
 0:  addiu  sp, sp, -24
 4:  lui    v0, %hi(gAmmo)
 8:  addiu  v0, v0, %lo(gAmmo)
 c:  sw     ra, 20(sp)
10:  lw     t6, 0(v0)
14:  subu   t7, t6, a0            # gAmmo - cost
18:  bgez   t7, 0x28              # skip the call if still non-negative
1c:  sw     t7, 0(v0)             # (slot) this store runs on both paths
20:  jal    clickSound
24:  sw     zero, 0(v0)           # (slot) overwrite with 0, in the call's delay slot
28:  lw     ra, 20(sp)
2c:  addiu  sp, sp, 24
30:  jr     ra
34:  nop
```

In C this is four plain lines: a subtract, a store, and an `if (gAmmo < 0)`
that clamps to zero and calls the sound function. Now look at what the
scheduler did to them. The first store sits in the *branch's* delay slot, so
it runs on both paths. The clamp in the "then" branch becomes a second store
that overwrites the first one, and that store sits in the *call's* delay
slot. The two statements fill two delay slots, and no cycles are wasted. The
prologue is interleaved with the address build. The instructions are out of
the C's order, and every statement is still present.

This is the final skill the tier has been building. You have been able to read
single instructions for two chapters already. Now you need to *un-schedule* a
function in your head: sort each instruction back into the C statement it
came from.

The target is a little bigger. It has **two** globals, so there are two
address builds, and you need to keep their registers apart. It has an
increment that must be stored *and* used, a multiply whose product feeds one
of the stores, and a threshold test that guards a call. Every fingerprint in
it was taught in its own lesson. Take it slowly, label every instruction, and
write the five lines it needs.

## Your task

`extern s32 gCombo;`, `extern s32 gScore;`, and
`extern void rumble(s32 strength);` are declared for you. Write `func_8027719c`
to reproduce the target assembly.

<!-- solution -->
```c
void func_8027719c(s32 points) {
    gCombo = gCombo + 1;
    gScore = gScore + points * gCombo;
    if (gCombo >= 10) {
        rumble(gCombo);
    }
}
```

<!-- context -->
```c
extern s32 gCombo;
extern s32 gScore;
extern void rumble(s32 strength);
```
