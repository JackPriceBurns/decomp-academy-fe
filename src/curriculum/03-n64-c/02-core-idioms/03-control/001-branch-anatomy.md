---
id: 47e9de28-8ccd-4b9b-bc63-cc871c610771
slug: control-branch-anatomy
title: Anatomy of a Branch
difficulty: 1
concepts:
  - control-flow
  - branches
  - delay-slots
  - mental-model
concept: true
---

# How an `if` becomes assembly

Until now every function ran straight down the page. This chapter is about
the ones that don't — and the handful of reading habits that make branchy
MIPS legible. Here's the C we'll dissect:

```c
s32 pick(s32 x) {
    if (x != 0) {
        return 5;
    }
    return 2;
}
```

and what IDO makes of it:

```asm
 0:  beqz  a0, 0x10       # x == 0? jump to the second return
 4:  addiu v0, zero, 2    # (delay slot) v0 = 2 — runs EITHER WAY
 8:  jr    ra             # return…
 c:  addiu v0, zero, 5    # (delay slot) …with v0 = 5
10:  jr    ra             # the branch lands here — v0 still holds 2
14:  nop
```

Four habits, one per paragraph.

## The branch tests the OPPOSITE of the C

The C says `if (x != 0)`; the assembly says `beqz` — branch if **equal to
zero**. That's not a mistake, it's the standard compilation: the branch's job
is to *skip* the "then" body, so it fires when the condition **fails**.
Whenever you decode a branch back into an `if`, flip the condition. A `bnez`
in the target usually means `== 0` in the C, a `beqz` means `!= 0`.

## The address operand is where it lands

`beqz a0, 0x10` names its destination — address `0x10`, the last `jr ra`.
Those addresses down the left gutter finally earn their keep: to follow a
branch, find the line whose address matches. Code between the branch and its
target is the code being jumped *over*.

## The delay slot runs either way

The line directly under the branch — `addiu v0, zero, 2` — executes **whether
or not the branch is taken**. You met this rule at `jr ra`; it's true of
every branch. Here the compiler uses it shrewdly: it loads the `return 2`
value *before* knowing if it's needed. If the branch is taken, we arrive at
`0x10` with `v0` already holding 2 — the work is done. If not, the 5
overwrites it and no harm done. Reading a branch means reading **two lines**:
the condition, and the slot beneath it.

## Count the returns

One C function, two `jr ra`s. IDO happily gives each `return` its own exit,
and each exit's delay slot carries its return value. A quick scan for `jr ra`
tells you how many ways out a function has — often the fastest way to guess
its shape before reading a single condition.

---

That's the whole toolkit: flip the condition, follow the address, read the
slot, count the exits. Every lesson in this chapter is one of these habits
getting sharper. Time to write your first branch.
