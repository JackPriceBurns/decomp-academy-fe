---
id: 79337951-16d1-4587-b0b9-3a7c9f03bf7b
slug: control-first-if
title: Your First Branch
difficulty: 1
concepts:
  - control-flow
  - branches
  - delay-slots
symbol: func_8024cde4
hints:
  - "`bnez` fires when x is NOT zero — so the C's `if` tests the opposite.
    Flip it."
  - "Each `jr ra`'s delay slot holds one of the two return values. Match each constant to its path."
---

# Reading it back the other way

The concept lesson dissected this listing — `if (x != 0) return 5; return 2;`
compiled:

```asm
 0:  beqz  a0, 0x10       # x == 0? skip to the far return
 4:  addiu v0, zero, 2    # (delay slot) the "skip" path's value, preloaded
 8:  jr    ra
 c:  addiu v0, zero, 5    # this exit returns 5
10:  jr    ra             # this exit returns the preloaded 2
14:  nop
```

Now you get to run the process in reverse on a fresh target. The recipe,
straight from the four habits:

1. **Read the branch and flip it.** The target's branch mnemonic tells you
   what the C tests — remember the branch fires when the `if` *fails*, so a
   `beqz` came from `!= 0` and a `bnez` came from `== 0`.
2. **Follow the address** to see which code is skipped.
3. **Read the slots.** The two return values are sitting in delay slots —
   one under the branch, one under a `jr ra`. Which value belongs to which
   path falls out of step 2.

One warning while the habit is young: the value under the *branch* belongs to
the **taken** path, even though it appears first in the listing. The listing
order and the logical order disagree — that's normal, and it stops feeling
strange within a few lessons.

Write plain, boring C — an `if` that returns one constant, then a final
`return` of the other. The compiler rebuilds all the cleverness.

## Your task

Write `func_8024cde4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8024cde4(s32 x) {
    if (x == 0) {
        return 8;
    }
    return 1;
}
```
