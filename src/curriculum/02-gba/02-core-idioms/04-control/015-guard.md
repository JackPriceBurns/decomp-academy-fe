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
    writes `r0`. So the guard has no arm of its own. It returns whatever arrived
    in `r0`, unchanged.
  - There are two `s32` arguments and an `s32` result. If the second argument is
    not positive, the function returns the first unchanged. Otherwise it
    subtracts twice the second from the first, and clamps the result to a floor
    of zero.
---

# A guard with no arm of its own

A guard is an `if` at the top of a function that returns early, before the main
work. In a listing it appears as the forward branch that reaches furthest in the
function. Everything between it and its target is the body it protects.

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

The guard is at addresses 2 through 8. `bgt 10` jumps into the body when the
argument is positive, so the early return is the fall-through. It needs two
instructions of its own: a `mov` to build the constant it returns, and a `b` to
jump all the way to the exit.

The rest is two ideas from earlier chapters, one after the other. The `lsl #2`
and `add` at 10 and 12 are a multiply by five, strength-reduced to a shift and
an add. The `cmp`/`ble`/`mov` at 14 through 18 is a ceiling clamp against the
second argument. The guard does not change how either of them compiles. Its
only effect is that both are skipped on the early return path.

Look at address 0. The argument is copied out of `r0` before anything else
happens. This is because both arms need `r0` for the return value, and the body
needs to keep working on the original. You pay for a copy like this whenever a
value must stay alive past a decision.

A guard does not always cost that much. Sometimes the value it returns is
already in `r0`, and nothing before the branch changes it. Then the whole early
return becomes the conditional branch alone. There is no `mov` to build a
value, no `b` to jump to the exit, and no arm at the fall-through. That is two
instructions instead of four. The only sign of the guard is a branch that
reaches further than any other in the function.

Your target has one of those. Find the branch that lands on the `bx lr`, and
work out what `r0` holds when it is taken. That gives you the guard. The rest of
the function is arithmetic and a clamp, and you have seen both already.

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
