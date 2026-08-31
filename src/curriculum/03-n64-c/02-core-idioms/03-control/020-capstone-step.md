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
  - "Each `beqzl`'s likely slot holds work for the taken path — one holds the OTHER comparison, one holds the copy-out. The `addiu`s tell you what each case does to `cur`."
---

# Everything at once

Last stop in this chapter — a tiny function you'd find in any game's
animation or camera code, and a listing where every line is in a delay slot,
a likely slot, or a branch. First, a warmup in the same spirit: a counter
that increments and wraps to zero at a limit:

```asm
 0:  addiu a0, a0, 1      # straight-line work first: i + 1
 4:  slt   at, a0, a1     # still below n?
 8:  bnezl at, 0x18       # yes: that's the answer —
 c:  or    v0, a0, zero   # (likely slot) return the incremented i
10:  or    a0, zero, zero # no: wrap to 0
14:  or    v0, a0, zero   # …and return that
18:  jr    ra
1c:  nop
```

That's `i = i + 1; if (i >= n) i = 0; return i;` — plain work, then a
guarded reset, if-converted onto a likely branch. (Note the branch tests the
condition that *keeps* `i`, so the C's `>=` shows up as an un-taken `<` —
one more flip to keep you honest.)

The target below is its two-sided cousin: nudge a value one step toward a
target — up if it's below, down if it's above, untouched if equal. Three
outcomes, so expect:

- **Two mirrored `slt`s** on the same two registers, one per direction —
  the min/max lesson taught you to read their operand order literally.
- **A `beqzl` whose likely slot computes the *second* `slt`** — the
  hoisted-test trick from the clamp lesson, riding a likely slot this time:
  the taken path is exactly the path that needs the next comparison.
- **A `b`** hopping the first outcome over the rest, its slot carrying that
  outcome's `addiu`.
- A shared copy-out that the equal case reaches without doing anything.

Write it as the C you'd naturally write: `if` / `else if`, one small
adjustment in each body, one return at the end. Then enjoy watching five
lessons' worth of fingerprints reassemble themselves.

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
