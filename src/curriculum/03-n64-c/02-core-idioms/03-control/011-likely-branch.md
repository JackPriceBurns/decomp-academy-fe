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
  - "`blezl` skips the increment when the C's test FAILS, and its likely slot
    holds the copy to the return register that only that path needs."
  - "The C is a plain guarded `+=` followed by a return. The `-l` form and the duplicated copy both come from the compiler."
---

# The l is for likely

Everything you know about delay slots has one exception, and IDO uses it a
lot. The branch-likely forms (`beqzl`, `bnezl`, `blezl` and others, all ending
in **l**) change the rule for the slot:

> A plain branch's slot **always** runs. A likely branch's slot runs **only
> if the branch is taken**. If the branch is not taken, the slot is cancelled.

So the compiler can put an instruction in the slot that would be *wrong* on
the fall-through path. Here is the kind of code that produces it, an
assignment inside an `if`: `if (x != 0) y = y + 3; return y;`:

```asm
 0:  beqzl a0, 0x10       # x == 0? skip the add, AND run the slot
 4:  or    v0, a1, zero   # (likely slot) v0 = y, unchanged; taken path only
 8:  addiu a1, a1, 3      # fall through: y += 3
 c:  or    v0, a1, zero   # …and v0 = the new y
10:  jr    ra
14:  nop
```

Follow each path. If the C's test fails (`x == 0`), the branch is taken. The
likely slot copies the *original* `y` into the return register, and the
function is done. If the test holds, the branch is not taken. **The slot is
cancelled as if it were not there**, the add runs, and a second copy finishes
the job.

Notice that the same `or v0, a1, zero` appears **twice**: once in the likely
slot, and once after the add. That duplication is the sign to look for. IDO
copied the "return y" ending onto both paths, so that each path can finish
without joining the other. A likely branch whose slot matches a later
instruction means a small `if` with no `else`, compiled by if-conversion.

None of this needs special C. Write the `if`, the assignment and the return,
and IDO chooses the `-l` form by itself. The target guards its increment with
a different test and a different amount. Read the branch (flipped, as always)
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
