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

# The loop test goes at the bottom

In C you write the loop test at the top. IDO almost never compiles it there.
Every loop in this chapter is built around one change called **rotation**: the
test moves to the *bottom* of the loop, as a conditional branch that jumps
*backwards*. Once you can read that one shape, you can read every loop in the
game.

Here is the smallest example. It is a `do`/`while` that changes two variables
until a counter runs out:

```asm
 0:  addiu a1, a1, -1     # n--
 4:  bgtz  a1, 0x0        # still positive? go around again
 8:  addiu a0, a0, -2     # (delay slot) the other body op, runs every trip
 c:  or    v0, a0, zero
10:  jr    ra
14:  nop
```

Three things here are always true:

- **The back-edge.** `bgtz a1, 0x0` jumps to an *earlier* address. Any branch
  that jumps backwards is a loop. Its target is the top of the loop, and
  everything from the target to the branch is the body.
- **The delay slot is part of the body.** The `addiu a0, a0, -2` after the
  branch runs on *every* iteration, including the last one, where the branch
  is not taken. A MIPS loop body does not end at the branch. It ends one line
  after it.
- **The test is the C condition, not flipped.** A branch for an `if` encodes
  the *opposite* of the C condition, because it jumps over the body. A
  back-edge encodes the condition *as written*, so `bgtz` here is
  `while (n > 0)`. If the branch is taken, the loop runs again.

## Where the top test goes

A `do`/`while` runs its body at least once, so a test at the bottom is all it
needs. A `while` or `for` loop can run **zero** times, and IDO still rotates
it. To handle this, IDO adds one extra test *before* the loop. That test is
flipped, and it jumps over the whole loop. Here is
`while (x > 0) { x >>= 1; c++; }`:

```asm
 0:  blez  a0, 0x18       # guard: zero trips? skip the entire loop
 4:  or    v1, zero, zero # (slot) c = 0, setup placed in the guard's slot
 8:  sra   t6, a0, 1      # ── loop top ──
 c:  or    a0, t6, zero
10:  bgtz  t6, 0x8        # back-edge: the while test, at the bottom
14:  addiu v1, v1, 1      # (slot) c++
18:  or    v0, v1, zero
1c:  jr    ra
20:  nop
```

**A guard plus a rotated body is a `while` loop.** You may see a forward
branch at the top of a function whose target is just past a back-edge. Don't
write an `if` around your loop for it. The guard is part of the loop itself.
Also notice that the guard's delay slot does setup work (`c = 0`).
Initialization code is often placed there.

## What comes next

Two more patterns complete the set. Each one has its own lesson:

- **The likely back-edge.** Sometimes the first instruction of the body
  depends on a value that the test just changed. Then IDO switches the
  back-edge to a branch-likely form (`bnezl`, `bgtzl`) and *copies the first
  instruction of the body into the delay slot*. You will see the same line
  twice, and you will learn to read it as one.
- **The ×4 unroll.** In a counted loop, the body is copied four times, and a
  small remainder loop is added in front of it. Three lines of C become forty
  lines of assembly. One instruction in the result does nothing useful, and
  that instruction is how you recognize the whole transformation.

Before you start, note that every loop here is a **leaf** loop: there are no
function calls inside it. A call in the body changes the rules completely
(different registers, a stack frame, no unrolling). The next tier covers
that. For now, find the back-edge, read its delay slot, and read its test as
written.
