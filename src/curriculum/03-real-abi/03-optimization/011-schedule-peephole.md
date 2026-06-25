---
id: optimization-schedule-peephole
title: "Chaining: Scheduling Plus a Dot-Merge"
difficulty: 4
concepts:
  - scheduling
  - peephole
  - dot-form
  - chaining
symbol: gate2
hints:
  - Two independent loads at the top is the scheduler batching them; the
    `clrlwi.` that masks-and-tests in one instruction is the peephole dot-merge.
  - Mask the first loaded value into a named local, then use that local both as
    the branch condition and as an operand of the arithmetic.
---

# The scheduler hands off to the peephole

Two of this chapter's passes run back to back. First the **scheduler** (lesson 2)
reorders, hoisting independent loads to the top so their latencies overlap. Then
the **peephole** pass (lesson 3) sweeps the result and performs its dot-form
merge — folding a `cmpwi ...,0` into the masking instruction by switching it to
its recording (`.`) form. In a small function you can watch the handoff: the
loads come first because of scheduling, and the mask-plus-test fuses because of
peephole.

Consider `sift(int *v)` — it loads two array slots, masks the **low 16 bits** of
the first, and if that masked value is non-zero subtracts it from the second slot,
otherwise just returns the second slot:

```asm
lwz     r0, 0(r3)     # both loads hoisted to the front (scheduler)
lwz     r3, 4(r3)
clrlwi. r0, r0, 16    # mask low 16 bits AND set cr0 — the dot-merge (peephole)
beqlr-                # masked value zero -> return the second slot unchanged
subf    r3, r0, r3    # else second slot - masked value
blr
```

Two things to read. The two `lwz` sit together at the top even though the source
used the second slot only in one branch — that batching is the scheduler. And
there is no separate `cmpwi`: `clrlwi.` masks *and* records the zero-test in one
instruction, so `beqlr-` branches straight off it. That fusion only happens
because the masked value is **reused** — it feeds both the test and the
arithmetic.

Your `gate2` has the same skeleton — two loads, a masked-and-tested first value,
a branch, then one combining op — but it masks a **different width** and uses a
**different** arithmetic operation on the surviving path. Read the `clrlwi.`
shift to recover the mask, and the post-branch instruction to recover the op.

## Your task

Write `gate2(int *p)` to reproduce the assembly above — both loads at the top, a
`clrlwi.` that merges the test, a `beqlr-`, then the arithmetic.

<!-- starter -->
```c
int gate2(int *p) {
    return 0;
}
```

<!-- solution -->
```c
int gate2(int *p) {
    int x = p[0] & 0xFF;
    int y = p[1];
    return x ? x + y : y;
}
```
