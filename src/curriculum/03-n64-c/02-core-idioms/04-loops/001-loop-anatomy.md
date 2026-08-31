---
id: c4d05259-0383-4d1b-b711-443752bc5a4c
slug: loops-anatomy
title: "The Anatomy of an IDO Loop"
difficulty: 2
concepts:
  - loops
  - delay-slots
  - branch-likely
  - mental-model
concept: true
---

# Loops go in at the bottom

In C you write the loop test at the top. IDO almost never compiles it there.
Every loop this chapter throws at you is built around one move — **rotation**:
the test goes to the *bottom*, as a conditional branch jumping *backwards*.
Learn to read that one shape and every loop in the game unfolds from it.

Here's the smallest possible specimen — a `do`/`while` that steps two
variables until a counter runs out:

```asm
 0:  addiu a1, a1, -1     # n--
 4:  bgtz  a1, 0x0        # still positive? go around again
 8:  addiu a0, a0, -2     # (delay slot) the other body op — runs every trip
 c:  or    v0, a0, zero
10:  jr    ra
14:  nop
```

Three things to burn in, because they never change:

- **The back-edge.** `bgtz a1, 0x0` targets an *earlier* address. Any branch
  aiming backwards is a loop; its target is the loop's top, and everything
  between target and branch is the body.
- **The slot is part of the body.** The `addiu a0, a0, -2` after the branch
  runs on *every* iteration — including the trip where the branch falls
  through. A MIPS loop body doesn't end at the branch; it ends one line after.
- **The test is the C condition un-flipped.** Branches inside `if`s encode the
  *opposite* of the C (jump over the body). A back-edge encodes the condition
  *as written* — `bgtz` here really is `while (n > 0)`. Taken = go again.

## Where did the top test go?

A `do`/`while` runs its body at least once, so a bottom test is all it needs.
But a `while` or `for` can run **zero** times — and IDO still rotates it. The
fix: one extra test *before* the loop, flipped, jumping clean over the whole
thing. Here's `while (x > 0) { x >>= 1; c++; }`:

```asm
 0:  blez  a0, 0x18       # guard: zero trips? skip the entire loop
 4:  or    v1, zero, zero # (slot) c = 0 — setup rides the guard's shadow
 8:  sra   t6, a0, 1      # ── loop top ──
 c:  or    a0, t6, zero
10:  bgtz  t6, 0x8        # back-edge: the while test, at the bottom
14:  addiu v1, v1, 1      # (slot) c++
18:  or    v0, v1, zero
1c:  jr    ra
20:  nop
```

**Guard + rotated body** — that pair *is* a `while` loop. When you see a
forward branch at the top of a function whose target sits just past a
back-edge, don't invent an `if` around your loop; the guard is part of the
loop itself. And note the guard's delay slot doing setup work (`c = 0`):
initialization loves to hide there.

## What's coming

Two more moves complete the family, each with its own lesson:

- **The likely back-edge.** When the body's first instruction depends on a
  value the test just changed, IDO switches the back-edge to a branch-likely
  form (`bnezl`, `bgtzl`) and *clones the body's first instruction into the
  slot* — you'll see the same line twice and learn to read it once.
- **The ×4 unroll.** Counted loops get their body duplicated four times, with
  a small remainder loop bolted on the front — three lines of C ballooning
  into forty of assembly, plus one gloriously useless instruction that
  fingerprints the whole transformation.

One heads-up before you start: everything here is a **leaf** loop — no
function calls inside. A call in the body changes the rules completely
(different registers, a stack frame, no unrolling), and the next tier deals
with that. For now: find the back-edge, read its slot, un-flip its test.
