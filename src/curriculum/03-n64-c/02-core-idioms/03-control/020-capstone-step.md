---
id: 371d21fb-5fb6-4cd0-83c4-19ce66d130fe
slug: control-capstone-step
title: "Capstone: Step Toward"
difficulty: 4
concepts:
  - control-flow
  - branches
  - delay-slots
  - capstone
symbol: func_801c7484
hints:
  - "Two `slt`s with mirrored operand orders = the classic less-than / greater-than pair on the same two values. An if / else if in C."
  - "Each `beqzl`'s likely slot holds work for the taken path: one holds the OTHER comparison, and one holds the copy to `v0`. The `addiu`s tell you what each case does to `cur`."
---

# Everything at once

This is the last lesson in this chapter. It is a tiny function of the kind you
would find in any game's animation or camera code, and every line of its
listing is in a delay slot, a likely slot, or a branch. First, a warmup of the
same kind: a counter that increments and wraps to zero at a limit:

```asm
 0:  addiu a0, a0, 1      # straight-line work first: i + 1
 4:  slt   at, a0, a1     # still below n?
 8:  bnezl at, 0x18       # yes: that's the answer...
 c:  or    v0, a0, zero   # (likely slot) return the incremented i
10:  or    a0, zero, zero # no: wrap to 0
14:  or    v0, a0, zero   # …and return that
18:  jr    ra
1c:  nop
```

That is `i = i + 1; if (i >= n) i = 0; return i;`: plain work, then a guarded
reset, if-converted onto a likely branch. (Note that the branch tests the
condition that *keeps* `i`, so the C's `>=` shows up as a `<` that is not
taken. That is one more flip to watch for.)

The target below is the two-sided version: it moves a value one step toward a
target. It goes up if the value is below, down if it is above, and stays the
same if they are equal. There are three outcomes, so expect:

- **Two mirrored `slt`s** on the same two registers, one for each direction.
  The min/max lesson taught you to read their operand order literally.
- **A `beqzl` whose likely slot computes the *second* `slt`.** This is the
  test computed early, as in the clamp lesson, but in a likely slot this
  time. The taken path is exactly the path that needs the next comparison.
- **A `b`** that sends the first outcome past the rest, with that outcome's
  `addiu` in its slot.
- A shared copy to `v0` that the equal case reaches without doing anything.

Write it as the C you would naturally write: `if` / `else if`, one small
change in each body, and one return at the end. Then you will see the
patterns from five lessons come together.

## Your task

Write `func_801c7484` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801c7484(s32 cur, s32 target) {
    if (cur < target) {
        cur = cur + 1;
    } else if (cur > target) {
        cur = cur - 1;
    }
    return cur;
}
```
