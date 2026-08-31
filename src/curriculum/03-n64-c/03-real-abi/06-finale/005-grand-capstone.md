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
  - "`multu`'s low word serves signed multiplies too. Its operands: the
    parameter, and the freshly incremented value about to be stored."
  - "The `slti` compares against 10 and the `bnez` *skips* the call — so the call runs on the opposite condition. Both globals are stored before the branch decides anything."
---

# The tier, in one function

This is the last exercise of the tier, and it's shaped like a function you
would actually meet in a shipped game: globals, a frame, a conditional
call, and optimizer scheduling smeared over all of it. First, a worked
sibling — `fireShot(cost)`, which spends ammo and complains when it runs
out:

```asm
 0:  addiu  sp, sp, -24
 4:  lui    v0, %hi(gAmmo)
 8:  addiu  v0, v0, %lo(gAmmo)
 c:  sw     ra, 20(sp)
10:  lw     t6, 0(v0)
14:  subu   t7, t6, a0            # gAmmo - cost
18:  bgez   t7, 0x28              # still non-negative? we're done
1c:  sw     t7, 0(v0)             # (slot) the store happens EITHER WAY
20:  jal    clickSound
24:  sw     zero, 0(v0)           # (slot) overwrite with 0, riding the call
28:  lw     ra, 20(sp)
2c:  addiu  sp, sp, 24
30:  jr     ra
34:  nop
```

In C this is four honest lines — subtract, store, and an `if (gAmmo < 0)`
that clamps to zero and calls a sound. But look at what the scheduler did
to them. The first store rides the *branch's* delay slot, executing on
both paths — so the "then" branch's clamp becomes a second store that
simply overwrites it, itself riding the *call's* delay slot. Two
statements, two delay slots, zero wasted cycles. The prologue is
interleaved with the address build. Nothing is where the C put it, and
everything is still there.

That's the final skill this tier asked you to build: not reading
instructions — you've been able to do that for two chapters — but
*un-scheduling* a function in your head, sorting each instruction into
the C statement it came from.

The target is one notch richer: **two** globals (two address builds — keep
their registers straight), an increment that must be stored *and* used, a
multiply whose product feeds one of the stores, and a threshold test
guarding a call. Every fingerprint in it has its own lesson behind it.
Take it slowly, label everything, and write the five lines it deserves.

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
