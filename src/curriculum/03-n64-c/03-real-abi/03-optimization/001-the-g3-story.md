---
id: 1627bb9a-3395-4019-a9c9-54efee18ad57
slug: opt-g3-story
title: "-O2 -g3: Why the Code Looks Like This"
difficulty: 2
concepts:
  - optimizer
  - debug-level
  - fingerprints
  - mental-model
concept: true
---

# The compiler's fingerprints have a name

For two chapters you have been collecting odd things in the assembly: stores
that nothing asked for, reloads of values that are still in registers, and
`nop`s in strange places. They all have one cause. This game was compiled at
**`-O2 -g3`**: full optimization, *with debugging support kept on*. That
combination does more than anything else to shape the assembly you are
matching. This chapter teaches you to recognize (and reproduce) the patterns it
leaves.

`-O2` gives you what you would expect from an optimizer: tight register use,
aggressive scheduling, and strength-reduced arithmetic. `-g3` adds one rule: *a
debugger attached at any instruction must still be able to make sense of the
program's state*. Following that rule leaves marks in the code. You have already
seen all three families of them:

**Family one: values kept findable in memory.** These are the homing stores for
unused and narrow arguments, and the arguments stored in home slots and
*reloaded* around calls even when the register still held the value. A
debugger can always find `x` at its known slot. The cost is one redundant `lw`.

**Family two: cautious delay slots.** The scheduler fills a `jal`'s slot with
argument setup, and a `jr ra`'s slot with the `addiu` that closes the frame. It
will not move your actual *computation* into the return slot, though, and it
leaves a `nop` where it has nothing safe to put. If filling a slot could make it
unclear which statement an instruction belongs to, `-g3` uses the `nop`.

**Family three: pipeline padding.** Some results are not ready on the very next
cycle. You saw two `nop`s after `mflo` in the warm-up divide, and a `nop` can
follow a lone `mul.s` before a return. IDO pads these hazards conservatively
instead of proving that they are safe. The next lessons show more of these.

## Seeing it side by side

Here is the function from the last chapter that keeps a value across a call.
`addAfter(x)` returns `work(x) + x`. This is exactly how this game's settings
compile it:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)     # x homed…
jal    work
lw     a0, 24(sp)     # …and reloaded for no reason (family one)
lw     t6, 24(sp)
lw     ra, 20(sp)
addu   v0, v0, t6     # the real work, kept out of the return slot
jr     ra
addiu  sp, sp, 24
```

And here is the same C compiled at `-O2` with debugging support *off* (`-g0`):

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    work
sw     a0, 24(sp)     # the store itself moves into the call's delay slot
lw     ra, 20(sp)
lw     t6, 24(sp)
addiu  sp, sp, 24
jr     ra
addu   v0, v0, t6     # the addition moves into the *return* slot
```

The C, the frame and the logic are the same. This version is two instructions
shorter, and the final `addu` has moved into the return's delay slot. Neither
version comes from "better C", because both come from the same C. **The debug
level is part of the target**, just as much as the source code is.

## What this means for matching

You never need to fight these fingerprints, and you cannot work around them. No
way of writing the C removes a homing store at `-g3`, and none adds one at
`-g0`. The grader compiles your code with the game's exact settings, so your job
is the same as always: write the *natural* C, and these patterns appear by
themselves. What changes now is how you read the assembly. When you see a
redundant reload, a cautious `nop`, or padding after a multiply, you will
recognize it as bookkeeping and not go looking for logic that isn't there.

The rest of this chapter covers the fingerprints one family at a time: which
delay slots get filled and which stay `nop`, where the hazard padding goes, and
how the optimizer reshapes loops and arithmetic.
