---
id: control-capstone-clamp-step
title: "Capstone: A Guarded, Clamped Update"
difficulty: 3
concepts:
  - capstone
  - guard
  - clamp
  - combining
  - branch
symbol: apply_damage
hints:
  - Three stages in a row — a guard, then a clamp on one value, then a clamp on
    another.
  - "`subf.` and `add.` set cr0 as a side effect, so the next branch needs no
    separate compare."
---

# Tying the chapter together

This capstone combines what the whole chapter built: an **early-return guard**,
some real arithmetic, and two **branchless-style clamps** — all in one function,
back to back. Nothing here is new; the only skill is reading three familiar
stages in sequence and noticing how MWCC fuses each clamp's compare into the
arithmetic that precedes it.

The fusion trick: instructions ending in `.` (like `subf.`, `add.`) update the
condition register *as a side effect*. So when a value is computed and then
immediately clamped, MWCC skips the separate `cmpwi` — the dotted arithmetic
already set the flags the branch reads.

Consider `step(pos, delta, limit)`: it ignores a non-positive limit, advances
`pos` by `delta`, then clamps the result into `[0, limit]`:

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

Three stages: the `blelr-` guard returns early; `add.` does the work *and* arms
the floor's `bge-` with no extra compare; the final `cmpw`/`blelr-`/`mr` caps the
top. Each piece is a lesson you've already done — the capstone is recognising
them stacked.

Your target is a different guarded-then-clamped function. Trace it stage by
stage: find the guard and its sentinel, the arithmetic in the middle, and the
clamp(s) that bound the result. Watch for dotted instructions feeding a branch
with no compare between them.

## Your task

Write `apply_damage`, taking `hp`, `dmg`, and `armor` (all `int`), to reproduce
the assembly above.

<!-- starter -->
```c
int apply_damage(int hp, int dmg, int armor) {
    return 0;
}
```

<!-- solution -->
```c
int apply_damage(int hp, int dmg, int armor) {
    if (hp <= 0) return 0;
    dmg = dmg - armor;
    if (dmg < 0) dmg = 0;
    hp = hp - dmg;
    if (hp < 0) hp = 0;
    return hp;
}
```
