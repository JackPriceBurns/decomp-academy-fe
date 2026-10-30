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

Until now, every function ran straight from top to bottom. This chapter is
about functions that branch, and the few reading habits that make branching
MIPS code readable. Here is the C we will study:

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
 4:  addiu v0, zero, 2    # (delay slot) v0 = 2, runs EITHER WAY
 8:  jr    ra             # return…
 c:  addiu v0, zero, 5    # (delay slot) …with v0 = 5
10:  jr    ra             # the branch jumps here; v0 still holds 2
14:  nop
```

There are four habits, one per section below.

## The branch tests the opposite of the C

The C says `if (x != 0)`, and the assembly says `beqz`: branch if **equal to
zero**. This is the standard way to compile an `if`, and it is correct. The
branch's job is to *skip* the "then" body, so it jumps when the condition
**fails**. Whenever you turn a branch back into an `if`, flip the condition. A
`bnez` in the target usually means `== 0` in the C, and a `beqz` means `!= 0`.

## The address operand is the destination

`beqz a0, 0x10` names its destination: address `0x10`, which is the last
`jr ra`. This is what the addresses in the left column are for. To follow a
branch, find the line whose address matches. The code between the branch and
its target is the code being jumped *over*.

## The delay slot runs either way

The line directly under the branch, `addiu v0, zero, 2`, runs **whether or not
the branch is taken**. You met this rule with `jr ra`, and it is true of every
branch. Here the compiler makes good use of it. It loads the `return 2` value
*before* it knows whether that value is needed. If the branch is taken,
execution arrives at `0x10` with `v0` already holding 2, so the work is done.
If the branch is not taken, the 5 overwrites it, which does no harm. Reading a
branch means reading **two lines**: the condition, and the slot beneath it.

## Count the returns

This one C function has two `jr ra`s. IDO will often give each `return` its
own exit, and each exit's delay slot holds that exit's return value. A quick
scan for `jr ra` tells you how many exits a function has. This is often the
fastest way to guess its shape before you read a single condition.

---

Those are the four habits: flip the condition, follow the address, read the
slot, count the exits. Every lesson in this chapter practises one of them. Next
you will write your first branch.
