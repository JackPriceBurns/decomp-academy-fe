---
id: 0688ca6c-96eb-41d0-805a-84cb4aeab3c2
slug: control-compare-branch
title: Branching on Two Values
difficulty: 2
concepts:
  - control-flow
  - branches
  - compare
symbol: func_801a2328
hints:
  - "`beq` fires when the two registers are equal — so the C's `if` asks when
    they're NOT. Flip, as always."
  - "Both exits return one of the arguments; the delay slots say which argument goes with which path."
---

# beq and bne

`beqz`/`bnez` compare one register against zero. Their two-register parents
compare any pair: `beq rs, rt` branches when the registers are **equal**,
`bne rs, rt` when they **differ**. Same flip-the-condition rule, same delay
slot, one more operand to read. Here's `if (a == b) return 1; return 0;`:

```asm
 0:  bne   a0, a1, 0x10   # a != b? skip to return the 0
 4:  or    v0, zero, zero # (delay slot) the 0, preloaded for that path
 8:  jr    ra
 c:  addiu v0, zero, 1    # equal: return 1
10:  jr    ra             # not equal: the preloaded 0 rides out
14:  nop
```

The C tests `==`; the branch is `bne` — inverted, exactly like the zero
forms. And the slot under the branch again carries the taken path's answer,
this time `or v0, zero, zero`: copying `zero` into `v0` is how the compiler
writes "v0 = 0" when it wants the register form (you've seen `or`-with-`zero`
as the copy since the bitwise chapter — copying *from* `zero` is just the
special case that produces 0).

Nothing else is new, and that's the point: from here on, branches compound
what you know rather than adding rules. The target below compares its two
arguments and returns one of *them* — not constants — so the delay slots hold
`or`-copies of argument registers. Trace which argument escapes through which
exit and the `if` writes itself.

## Your task

Write `func_801a2328` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801a2328(s32 a, s32 b) {
    if (a != b) {
        return a;
    }
    return b;
}
```
