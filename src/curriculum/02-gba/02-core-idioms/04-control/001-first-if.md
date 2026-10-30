---
id: 9297e3bd-444d-4407-b48a-e6a1eeb41ca6
slug: gba-control-first-if
title: Your First Branch
difficulty: 1
concepts:
  - branches
  - control-flow
  - comparisons
symbol: func_0811a638
hints:
  - The branch at address 2 jumps over the instruction at 4. Work out what must
    be true for that instruction to run. That is the condition in the source.
  - There are two `s32` arguments and an `s32` result. The guarded statement
    adds the second argument to the first, and the function returns the first
    argument.
---

# The branch jumps when the condition is false

An `if` in C says "run this code when the condition is true". The ARM7TDMI has
no instruction that does this directly. It has a compare, which does a
subtraction, keeps the four condition flags and throws the result away. It also
has branches that read those flags. So the compiler builds an `if` from these
two parts. It puts the guarded code in a straight line with a branch in front
of it. The branch jumps *past* the code when the condition is false.

This inversion is the first thing to learn. For a plain guarded statement, the
branch mnemonic in the listing is the opposite of the operator in the source.

```asm
0        cmp       r0, r1
2        bne       6 ~>
4        mov       r0, #0
6      ~>bx        lr
```

`cmp r0, r1` sets the flags from `r0 - r1`. `bne 6` skips the instruction at 4
whenever the two registers are different, so the `mov` runs only when they are
equal. The source condition was `==`, and the listing shows `bne`. The `~>` in
the gutter at address 6 marks where a branch lands. Everything between the
branch and its target is the body of the `if`.

Here is the same structure with a constant and a different comparison:

```asm
0        cmp       r0, #3
2        ble       6 ~>
4        sub       r0, r1
6      ~>bx        lr
```

`ble` skips the subtraction when the first argument is less than or equal to 3,
so the subtraction runs when it is greater than 3. The source has `>` and the
listing has `ble`. Read every branch this way: take the opposite of the
mnemonic, and you have the condition that was written.

There is no `push` and no `pop` in either listing. A function that calls nothing
keeps its return address in `lr` the whole time and returns with a single
`bx lr`. So the guarded body sits between the branch and that one return.

Your target has the same four instructions: a compare, a branch over one
instruction, that instruction, and the return.

## Your task

Write `func_0811a638` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0811a638(s32 hp, s32 heal) {
    if (hp != 0) hp += heal;
    return hp;
}
```
