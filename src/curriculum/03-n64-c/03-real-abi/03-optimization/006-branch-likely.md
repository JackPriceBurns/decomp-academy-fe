---
id: 7243ff43-f8d9-4a25-8096-943b1783f08a
slug: opt-branch-likely
title: "Branch Likely: The Slot That Sometimes Runs"
difficulty: 3
concepts:
  - optimizer
  - branch-likely
  - delay-slots
  - conditionals
symbol: func_80090ffc
hints:
  - "Compare the `slt` operand order against the worked example — the arguments trade places. What question is this one asking?"
  - "The shape is a one-`if` clamp. Decide which argument survives when the branch is taken and which when it falls through."
---

# A delay slot with an escape clause

Every branch you've read so far executes its delay slot no matter what. The
`l`-suffixed **likely** branches change the deal: the slot instruction runs
**only when the branch is taken** — on the fall-through path it's annulled, as
if it never existed. That lets the compiler park an instruction belonging to
the *taken* path right in the slot.

Here's `maxOf(a, b)`, which returns the larger argument:

```asm
 0:  slt    at, a0, a1     # at = (a < b)
 4:  beqzl  at, 0x14       # not less? branch to the return — LIKELY
 8:  or     v0, a0, zero   #   slot: v0 = a … only if the branch is taken
 c:  or     a0, a1, zero   # fall-through: a = b
10:  or     v0, a0, zero   # v0 = a (the updated a)
14:  jr     ra
18:  nop
```

Walk both paths. If `a >= b`: `beqzl` fires, the slot sets `v0 = a`, done. If
`a < b`: the slot is *annulled*, execution falls to `0xc`, `b` overwrites `a`,
and the copy into `v0` happens at `0x10` instead. Two copies of `v0 = a` is
exactly how the C reads: one `if` that may replace `a`, then a single
`return a`.

When does IDO pick a likely branch over a plain one? When it has something
useful to annul — a slot instruction that belongs to only one path. You saw
`bc1fl` do this with floats last lesson; `beqzl`, `bnezl`, and `beql` are the
integer family. Don't try to force or avoid them in C: write the natural
conditional and the compiler chooses.

The target is the same clamp shape, but read the `slt` carefully: its operands
are reversed, so it asks a different question — and a different argument gets
replaced.

## Your task

Write `func_80090ffc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80090ffc(s32 x, s32 cap) {
    if (x > cap) {
        x = cap;
    }
    return x;
}
```
