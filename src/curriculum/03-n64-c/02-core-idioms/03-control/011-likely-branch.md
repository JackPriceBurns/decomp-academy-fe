---
id: 7b204817-f78f-4a04-9c75-349f7275d294
slug: control-likely-branch
title: "Branch Likely: The Slot That Doesn't Always Run"
difficulty: 3
concepts:
  - branches
  - branch-likely
  - delay-slots
  - fingerprints
symbol: func_802c8120
hints:
  - "`blezl` skips the increment when the condition FAILS the C's test — and
    its likely slot holds the copy-out that only that path needs."
  - "The C is a plain guarded `+=` followed by a return. The `-l` form and the duplicated copy both come from the compiler."
---

# The l is for likely

Everything you know about delay slots has one exception, and IDO leans on it
hard. The branch-likely forms — `beqzl`, `bnezl`, `blezl`, and friends, all
ending in **l** — change the slot's contract:

> A plain branch's slot **always** runs. A likely branch's slot runs **only
> if the branch is taken**. Not taken? The slot is cancelled.

That gives the compiler a superpower: it can park an instruction that would
be *wrong* on the fall-through path. Here's the shape that summons it —
a guarded assignment, `if (x != 0) y = y + 3; return y;`:

```asm
 0:  beqzl a0, 0x10       # x == 0? skip the add — AND run the slot
 4:  or    v0, a1, zero   # (likely slot) v0 = y, untouched — taken path only
 8:  addiu a1, a1, 3      # fall through: y += 3
 c:  or    v0, a1, zero   # …and v0 = the new y
10:  jr    ra
14:  nop
```

Follow each path. Condition fails the C's test (`x == 0`): branch taken, the
likely slot copies the *original* `y` out, done. Condition holds: branch not
taken, **the slot is cancelled as if it weren't there**, the add runs, and a
second copy-out finishes the job.

Notice the same `or v0, a1, zero` appears **twice** — once in the likely
slot, once after the add. That duplication is the give-away: IDO cloned the
"return y" ending onto both paths so each could finish without a join. A
likely branch whose slot mirrors a later instruction = a small `if` with no
`else`, compiled by if-conversion.

None of this needs special C. Write the guard, the assignment, the return —
IDO chooses the `-l` form on its own. The target guards its increment with a
different test and a different amount; read the branch (flipped, as ever)
and the `addiu`.

## Your task

Write `func_802c8120` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802c8120(s32 hits, s32 score) {
    if (hits > 0) {
        score = score + 12;
    }
    return score;
}
```
