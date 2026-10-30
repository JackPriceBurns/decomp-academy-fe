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
  - "`beq` jumps when the two registers are equal, so the C's `if` tests
    whether they are NOT equal. Flip it, as always."
  - "Both exits return one of the arguments; the delay slots say which argument goes with which path."
---

# beq and bne

`beqz`/`bnez` compare one register with zero. The two-register versions
compare any pair: `beq rs, rt` branches when the registers are **equal**, and
`bne rs, rt` branches when they **differ**. You still flip the condition, and
the delay slot works the same way. There is one more operand to read. Here is
`if (a == b) return 1; return 0;`:

```asm
 0:  bne   a0, a1, 0x10   # a != b? skip to return the 0
 4:  or    v0, zero, zero # (delay slot) the 0, preloaded for that path
 8:  jr    ra
 c:  addiu v0, zero, 1    # equal: return 1
10:  jr    ra             # not equal: the preloaded 0 is returned
14:  nop
```

The C tests `==`, and the branch is `bne`. The condition is inverted, exactly
as with the zero forms. The slot under the branch again holds the taken path's
value, this time `or v0, zero, zero`. Copying `zero` into `v0` is how the
compiler writes "v0 = 0" when it wants the register form. You have seen `or`
with `zero` used as a copy since the bitwise chapter. Copying *from* `zero` is
the special case that produces 0.

Nothing else is new. From here on, branches combine things you already know
and do not add new rules. The target below compares its arguments and returns
one of *them*, not a constant, so the delay slots hold `or` copies of argument
registers. Work out which argument leaves through which exit, and you can
write the `if`.

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
