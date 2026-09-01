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
  - The branch at address 2 steps over the instruction at 4. Ask what has to be
    true for that instruction to run, and you have the condition the source
    wrote.
  - Two `s32` arguments and an `s32` result. The guarded statement adds the
    second argument onto the first, and the first argument is also what comes
    back.
---

# The branch jumps when the condition is false

An `if` in C says "run this when the condition holds". The ARM7TDMI has no
instruction for that. It has a compare, which performs a subtraction, keeps the
four condition flags and throws the difference away, and it has branches that
read those flags. So the compiler builds an `if` out of the only material
available: the guarded code goes in a straight line and a branch goes in front
of it, jumping *past* it when the condition fails.

That inversion is the first thing to internalise. For a plain guarded
statement, the mnemonic in the listing is the negation of the operator in the
source.

```asm
0        cmp       r0, r1
2        bne       6 ~>
4        mov       r0, #0
6      ~>bx        lr
```

`cmp r0, r1` sets the flags from `r0 - r1`. `bne 6` skips the instruction at 4
whenever the two registers differ, so the `mov` runs exactly when they are
equal — the source condition was `==` and the listing shows you `bne`. The `~>`
in the gutter at address 6 marks where a branch lands; everything between the
branch and its target is the body of the `if`.

Here is the same skeleton with a constant and a different relation:

```asm
0        cmp       r0, #3
2        ble       6 ~>
4        sub       r0, r1
6      ~>bx        lr
```

`ble` skips the subtraction when the first argument is less than or equal to 3,
so the subtraction runs when it is greater than 3. Source `>`, listing `ble`.
Read every branch this way: flip the mnemonic and you have the condition that
was written.

There is no `push` and no `pop` in either listing. A function that calls nothing
keeps its return address in `lr` for its whole life and leaves through a single
`bx lr`, so the guarded body sits between the branch and that one return.

Your target is the same four-instruction skeleton: a compare, a branch over one
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
