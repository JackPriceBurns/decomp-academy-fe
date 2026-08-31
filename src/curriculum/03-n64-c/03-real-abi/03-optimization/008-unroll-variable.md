---
id: a9066426-2a83-468a-9be0-af426e3c8131
slug: opt-unroll-variable
title: Unrolling an Unknown Count
difficulty: 4
concepts:
  - optimizer
  - loops
  - unrolling
  - fingerprints
symbol: func_80241990
hints:
  - "Ignore the machinery and find the two loop bodies. Each stores the same thing — what, and through which register?"
  - "The whole two-loop tower comes from a three-line `for` loop over `n` elements. Don't write two loops in C."
---

# The unroller meets a count it can't see

Last lesson the trip count was a constant that divided neatly by four. But
what if the loop runs `n` times and `n` is only known at runtime? IDO still
wants its ×4 loop — so it emits a **cleanup loop first** to handle `n mod 4`
elements one at a time, then the fat loop for the rest. Here's `total(p, n)`,
which sums the first `n` words at `p`:

```asm
 0:  or     v1, zero, zero    # sum = 0
 4:  blez   a1, 0x70          # n <= 0 → skip everything
 8:  or     v0, zero, zero    # i = 0 (slot)
 c:  andi   t0, a1, 0x3       # n & 3: how many leftovers
10:  beqz   t0, 0x38          # none → straight to the main loop
14:  or     a3, t0, zero
18:  sll    t6, zero, 2       # i×4, with i provably zero (!)
1c:  addu   a2, a0, t6
20:  lw     t7, 0(a2)         # ── cleanup loop: ONE element per trip ──
24:  addiu  v0, v0, 1
28:  addiu  a2, a2, 4
2c:  bne    a3, v0, 0x20
30:  addu   v1, v1, t7
34:  beq    v0, a1, 0x70      # the leftovers were the whole job? done
38:  sll    t8, v0, 2         # ── main loop setup: resume + end pointers ──
3c:  sll    t9, a1, 2
40:  addu   a3, t9, a0
44:  addu   a2, a0, t8
48:  lw     t1, 0(a2)         # ── main loop: FOUR elements per trip ──
4c:  lw     t2, 4(a2)
50:  lw     t3, 8(a2)
54:  addu   v1, v1, t1
58:  lw     t4, 12(a2)
5c:  addu   v1, v1, t2
60:  addiu  a2, a2, 16
64:  addu   v1, v1, t3
68:  bne    a2, a3, 0x48
6c:  addu   v1, v1, t4
70:  or     v0, v1, zero
74:  jr     ra
78:  nop
```

Thirty instructions, one C statement repeated. The anatomy, top to bottom:
guard (`blez`), leftover count (`andi … 3`), a one-at-a-time loop for the
leftovers, an early-out if that finished the job, then the ×4 loop running to
a precomputed **end pointer** instead of a counter. Even the nonsense
`sll t6, zero, 2` — an index computed from a provably-zero `i` — is part of
the template, faithfully emitted.

Once you can name the sections, a tower like this stops being thirty puzzles
and becomes one: *find the body*. Here the body appears twice — `lw`, then
`addu` into `v1` — so the C is `sum += p[i]` in a loop over `n`. Everything
else is unroller scaffolding that your three-line loop regenerates for free.

The target is the same template around a different, slightly smaller body.
Find both copies of it.

## Your task

Write `func_80241990` to reproduce the target assembly.

<!-- solution -->
```c
void func_80241990(s32 *p, s32 n) {
    s32 i;

    for (i = 0; i < n; i++) {
        p[i] = 0;
    }
}
```
