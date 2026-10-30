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
  - "Compare the `slt` operand order with the worked example. The arguments have swapped places. What question is this one asking?"
  - "The shape is a clamp with one `if`. Work out which argument is kept when the branch is taken, and which one is kept when it falls through."
---

# A delay slot that can be skipped

Every branch you have read so far runs its delay slot in every case. The
**likely** branches, the ones ending in `l`, work differently: the slot
instruction runs **only when the branch is taken**. On the fall-through path it
is annulled, as if it were not there. This allows the compiler to put an
instruction that belongs to the *taken* path straight into the slot.

Here is `maxOf(a, b)`, which returns the larger argument:

```asm
 0:  slt    at, a0, a1     # at = (a < b)
 4:  beqzl  at, 0x14       # not less? branch to the return (LIKELY)
 8:  or     v0, a0, zero   #   slot: v0 = a … only if the branch is taken
 c:  or     a0, a1, zero   # fall-through: a = b
10:  or     v0, a0, zero   # v0 = a (the updated a)
14:  jr     ra
18:  nop
```

Follow both paths. If `a >= b`, `beqzl` is taken, the slot sets `v0 = a`, and
the function is done. If `a < b`, the slot is *annulled*, execution falls
through to `0xc`, `b` overwrites `a`, and the copy into `v0` happens at `0x10`
instead. The two copies of `v0 = a` match how the C reads: one `if` that may
replace `a`, followed by a single `return a`.

IDO picks a likely branch over a plain one when it has something useful to
annul: a slot instruction that belongs to only one path. You saw `bc1fl` do
this with floats in the last lesson. `beqzl`, `bnezl` and `beql` are the
integer versions. Don't try to force or avoid them in C. Write the natural
conditional, and the compiler chooses.

The target has the same clamp shape, but read the `slt` carefully. Its operands
are reversed, so it asks a different question, and a different argument gets
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
