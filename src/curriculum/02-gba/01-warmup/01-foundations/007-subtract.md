---
id: 97d507c7-a675-431d-9a5d-2fc6d86fc062
slug: gba-foundations-subtract
title: Taking a Constant Away
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: decay
hints:
  - The target subtracts, so your C should too — the constant is the one shown.
  - Adding a negative number would compile to exactly the same `sub`, so either
    spelling matches.
---

# The instruction picks itself

Subtracting a constant is the mirror of adding one:

```asm
0        sub       r0, #20
2        bx        lr
```

`sub rD, #imm` is `rD = rD - imm`, with the same eight-bit immediate field and
the same lack of any separate load.

Here is the part worth noticing. This function does not subtract anything — it
adds negative nine:

```c
s32 backNine(s32 x) {
    return x + -9;
}
```

and the compiler emits this:

```asm
0        sub       r0, #9
2        bx        lr
```

There is no "add a negative" instruction, so `add` and `sub` are chosen purely
by the sign of the constant. Two different-looking pieces of C collapse to the
same instruction, which means the assembly cannot tell you which one the
original author wrote. Matching is about instructions, so either is correct —
and you will meet this ambiguity constantly. Write whichever reads more
naturally.

## Your task

Write `decay`, taking an `s32 x`, to reproduce the target assembly.

<!-- starter -->
```c
s32 decay(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 decay(s32 x) {
    return x - 5;
}
```
