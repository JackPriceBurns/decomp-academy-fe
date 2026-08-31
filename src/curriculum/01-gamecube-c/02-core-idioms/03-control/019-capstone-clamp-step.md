---
id: e47f67fd-3689-57c3-a4a9-f52d7df9b8bb
slug: control-capstone-clamp-step
title: "Capstone: A Guarded, Clamped Update"
difficulty: 3
concepts:
  - capstone
  - guard
  - clamp
  - combining
  - branch
symbol: func_8011fd9c
hints:
  - Three stages in a row — a guard, then a clamp on one value, then a clamp on
    another.
  - "`subf.` and `add.` set cr0 as a side effect, so the next branch needs no
    separate compare."
---

# A guard, arithmetic, and two clamps

This one mixes a guard, arithmetic, and clamps. The function leans on an
**early-return guard** to drop junk inputs, runs a little arithmetic, then uses
**branchless-style clamps** to keep the answer in bounds. No new instruction
appears — the challenge is recognising machinery you've already built, plus one
MWCC habit of welding a clamp's compare onto the arithmetic that just ran.

The weld hangs on the trailing dot. When a mnemonic carries a `.` — say `add.`
or `subf.` — it updates the condition register as a *side effect* of its real
work. So a freshly computed value that needs clamping skips its own `cmpwi`;
the dotted op already set the flags the branch will test.

In `step(pos, delta, limit)`, a non-positive limit gets ignored outright, `pos`
moves up by `delta`, and the result ends up wedged inside `[0, limit]`:

```asm
cmpwi r5,0         # guard: limit <= 0 ?
blelr-             # yes -> return pos untouched
add.  r3,r3,r4     # pos += delta, and set cr0 from the result
bge-  .check_hi    # result >= 0 -> skip the floor
li    r3,0         # floor: clamp up to 0
.check_hi:
cmpw  r3,r5        # result vs limit
blelr-             # <= limit -> done, return it
mr    r3,r5        # otherwise saturate to limit
blr
```

The `blelr-` near the top is the guard, gone the moment it must be. Right
after, `add.` does the arithmetic and, for free, arms the floor's `bge-`. The
tail — `cmpw` into `blelr-` into `mr` — holds the value under the ceiling.
You've written each move already; the real exercise is noticing them strung
together.

Yours guards and clamps something different, but you read it the same way. The
guard and its return value come first, the working arithmetic sits in the
middle, and a clamp or two fences the result at the end. Spot a dotted op
pressed against a branch with no compare in the gap, and the fusion is showing
its face again.

## Your task

Write `func_8011fd9c` to reproduce the assembly above.

<!-- solution -->
```c
int func_8011fd9c(int hp, int dmg, int armor) {
    if (hp <= 0) return 0;
    dmg = dmg - armor;
    if (dmg < 0) dmg = 0;
    hp = hp - dmg;
    if (hp < 0) hp = 0;
    return hp;
}
```
