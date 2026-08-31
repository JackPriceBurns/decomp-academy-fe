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

You've been collecting oddities for two chapters: stores nothing asked for,
reloads of values still sitting in registers, `nop`s in strange places. Time to
name their common cause. This game was compiled at **`-O2 -g3`** — full
optimization, *with debugging support kept on*. That combination is the single
biggest personality trait of the assembly you're matching, and this chapter is
about learning to read (and reproduce) its tells.

`-O2` gives you everything you'd expect from an optimizer: tight register use,
aggressive scheduling, strength-reduced arithmetic. `-g3` then holds it to one
promise — *a debugger attached at any instruction should still make sense of
the world* — and keeping that promise leaves marks. You've already met all
three families:

**Family one: values kept findable in memory.** Homing stores for unused and
narrow arguments; arguments parked in home slots and *re-loaded* around calls
even when the register still held the value. A debugger can always find `x` at
its known slot; you pay one redundant `lw`.

**Family two: cautious delay slots.** The scheduler fills a `jal`'s slot with
argument setup and a `jr ra`'s slot with the frame-closing `addiu` — but it
declines to hoist your actual *computation* into the return slot, and leaves
`nop` where it has nothing safe. Where a slot could blur which statement an
instruction belongs to, `-g3` prefers the `nop`.

**Family three: pipeline padding.** Some results aren't ready the very next
cycle — you saw two `nop`s after `mflo` back in the warm-up divide, and a
`nop` can trail a lone `mul.s` before a return. IDO pads these hazards
conservatively rather than proving them safe. More of these in the lessons
ahead.

## Seeing it side by side

Here's the keep-across-a-call function from last chapter — `addAfter(x)`,
returning `work(x) + x` — exactly as this game's settings compile it:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)     # x homed…
jal    work
lw     a0, 24(sp)     # …and pointlessly reloaded (family one)
lw     t6, 24(sp)
lw     ra, 20(sp)
addu   v0, v0, t6     # the real work, kept out of the return slot
jr     ra
addiu  sp, sp, 24
```

And the same C compiled at `-O2` with debugging support *off* (`-g0`):

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    work
sw     a0, 24(sp)     # the store itself rides the call's delay slot
lw     ra, 20(sp)
lw     t6, 24(sp)
addiu  sp, sp, 24
jr     ra
addu   v0, v0, t6     # the addition rides the *return* slot
```

Same C, same frame, same idea — two instructions shorter, and the final `addu`
has slid into the return's shadow. Neither version is "better C"; they're the
same C. **The debug level is part of the target**, as much as the source code
ever was.

## What this means for matching

You never fight these fingerprints, and you can't outsmart them — there is no
C spelling that removes a homing store at `-g3`, and none that adds one at
`-g0`. The grader compiles your code with the game's exact settings, so your
job stays what it has always been: write the *natural* C, and the tics appear
on their own. What changes now is your reading: when you see a redundant
reload, a timid `nop`, or padding after a multiply, you'll recognize
bookkeeping instead of hunting for phantom logic.

The rest of this chapter walks the fingerprints one family at a time — which
delay slots get filled and which stay `nop`, where the hazard padding lands,
and how the optimizer reshapes loops and arithmetic underneath it all.
