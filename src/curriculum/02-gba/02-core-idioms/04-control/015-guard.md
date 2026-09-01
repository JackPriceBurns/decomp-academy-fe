---
id: 67dae622-ba43-4608-a6f6-df18c48f20fb
slug: gba-control-guard
title: A Guard at the Top
difficulty: 4
concepts:
  - branches
  - control-flow
  - register-allocation
symbol: func_08158e90
hints:
  - The branch at the top goes straight to the `bx lr`, and nothing between them
    writes `r0`. So the guard has no arm of its own — the value it returns is
    whatever arrived in `r0` and was never disturbed.
  - Two `s32` arguments and an `s32` result. A non-positive second argument
    bails out with the first unchanged; otherwise twice the second is taken off
    the first and the result is floored at zero.
---

# A guard with no arm of its own

A guard is an `if` at the top of a function that bails out before the real work.
In a listing it shows up as a forward branch with the longest reach in the
function — everything between it and its target is the body it protects.

```asm
0        mov       r2, r0
2        cmp       r2, #0
4        bgt       10 ~>
6        mov       r0, #0
8        b         22 ~>
10     ~>lsl       r0, r2, #2
12       add       r2, r0, r2
14       cmp       r2, r1
16       ble       20 ~>
18       mov       r2, r1
20     ~>mov       r0, r2
22     ~>bx        lr
```

The guard is addresses 2 through 8. `bgt 10` jumps into the body when the
argument is positive, so the bail-out is the fall-through — and it needs two
instructions of its own, a `mov` to build the constant it returns and a `b` to
carry it all the way to the exit.

The rest is two ideas from earlier chapters standing next to each other. The
`lsl #2` and `add` at 10 and 12 are a multiply by five, strength-reduced. The
`cmp`/`ble`/`mov` at 14 through 18 is a ceiling clamp against the second
argument. Neither is doing anything a guard makes special; the guard's only
effect is that they are skipped entirely on the bail-out path.

Look at address 0. The argument is copied out of `r0` before anything else
happens, because `r0` is needed for the return value in both arms and the body
wants to keep working on the original. The copy is the price of having a value
live across a decision.

A guard does not always cost that much. When the value it hands back is already
sitting in `r0` and nothing before the branch disturbs it, the whole bail-out
collapses into the conditional branch itself — no `mov` to build a value, no `b`
to carry it, no arm at the fall-through at all. Two instructions instead of
four, and the only sign a guard was ever there is a branch reaching further than
any other in the function.

Your target has one of those. Find the branch that lands on the `bx lr`, work
out what `r0` holds when it is taken, and the guard writes itself; the rest of
the function is arithmetic and a clamp you have both met already.

## Your task

Write `func_08158e90` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08158e90(s32 hp, s32 dmg) {
    if (dmg <= 0) return hp;
    hp -= dmg * 2;
    if (hp < 0) hp = 0;
    return hp;
}
```
