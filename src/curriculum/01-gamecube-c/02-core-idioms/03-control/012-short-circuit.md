---
id: 0a9f96b1-c2f9-5af8-b7b8-445e9c95df2f
slug: control-short-circuit
title: Short-Circuit && and ||
difficulty: 3
concepts:
  - boolean
  - short-circuit
  - branch
  - logic
symbol: func_802a7e58
hints:
  - "`&&` short-circuits: a failing first test skips the second compare."
  - Expect two `cmpwi ..., 0` with a `ble-` after each jumping to the false exit.
---

# Reading short-circuit branches

`&&` evaluates its right-hand operand only if the left one is true. `||`
evaluates its right-hand operand only if the left one is false. Both can
produce compares separated by branches, but the surrounding C also affects
where those branches lead.

Consider a check with three conditions: a mode must differ from 3, an offset
must be below -2, and a count must be at least 5. Returning the logical
expression directly gives early returns:

```c
int mixed_expression(int mode, int offset, int count) {
    return mode != 3 && offset < -2 && count >= 5;
}
```

```asm
cmpwi   r3,3
li      r3,0
beqlr-
cmpwi   r4,-2
bgelr-
cmpwi   r5,5
bltlr-
li      r3,1
blr
```

MWCC sets `r3` to zero before the conditional returns. Each branch tests a
different failure: mode equal to 3, offset at least -2, or count below 5.
If all three tests pass, the function reaches `li r3,1`.

Writing the same condition with an `if` and separate return statements changes
the branch layout:

```c
int mixed_if(int mode, int offset, int count) {
    if (mode != 3 && offset < -2 && count >= 5) return 1;
    return 0;
}
```

```asm
 0: cmpwi   r3,3
 4: beq-    20 <mixed_if+0x20>
 8: cmpwi   r4,-2
 c: bge-    20 <mixed_if+0x20>
10: cmpwi   r5,5
14: blt-    20 <mixed_if+0x20>
18: li      r3,1
1c: blr
20: li      r3,0
24: blr
```

Here `beq-`, `bge-`, and `blt-` jump to the shared false exit at offset `0x20`,
where `li r3,0` is followed by `blr`. The functions return the same values,
but only the second form has this shared-exit layout. Check the target's
branch destinations when deciding which form to write.

For `||`, a successful first test skips the second test. This example checks
whether either value is at least 10:

```c
int either_large(int a, int b) {
    if (a >= 10 || b >= 10) return 1;
    return 0;
}
```

```asm
 0: cmpwi   r3,10
 4: bge-    10 <either_large+0x10>
 8: cmpwi   r4,10
 c: blt-    18 <either_large+0x18>
10: li      r3,1
14: blr
18: li      r3,0
1c: blr
```

The first branch jumps to the true exit at `0x10`. If the first test fails,
the second compare decides whether to fall through to that exit or branch to
the false exit at `0x18`. Follow each branch to the value it returns before
reconstructing the condition.

## Your task

Write `func_802a7e58` to reproduce the target assembly.

<!-- solution -->
```c
int func_802a7e58(int a, int b) {
    if (a > 0 && b > 0) return 1;
    return 0;
}
```
