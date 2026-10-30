---
id: 5f4b4e6f-590b-456f-a569-5fd8c6cfc649
slug: types-homing-ritual
title: "The Homing Ritual"
difficulty: 3
concepts:
  - types
  - arg-homing
  - fingerprints
  - sign-extension
symbol: func_803d2d38
hints:
  - "There are two homing stores and two re-extensions, but the two arguments re-extend *differently*. One gets the shift pair and the other gets a mask. Read the width and signedness of each one from its idiom."
  - "The real work of the function is a single `addu`. Everything above it is the ritual, and all of it comes from the two parameter declarations."
---

# Stores that are never read

When a function has a narrow parameter, IDO starts it with a sequence of
instructions that confuses most people the first time they see it. Here is
`add_bytes`. Its *entire* C body is `return a + b` on two `s8`s:

```c
s32 add_bytes(s8 a, s8 b) {
    return a + b;
}
```

```asm
sw    a0, 0(sp)     # a stored to the stack…
sll   t6, a0, 24    # …and sign-extended in place
sw    a1, 4(sp)     # b stored to the stack…
sll   t8, a1, 24    # …and sign-extended too
sra   a1, t8, 24
sra   a0, t6, 24
addu  v0, a0, a1    # the actual function
jr    ra
nop
```

That is eight instructions for a one-line function, and something about them
is odd: **nothing ever reads `0(sp)` or `4(sp)`**. The `sra` instructions take
their inputs from registers. The two `sw`s are dead stores. They are written
and never loaded, so they could be removed completely. Even so, IDO emits them
at `-O2`, every time, for every narrow argument.

This is **argument homing**. Each of the four argument registers has its own
reserved stack slot (`a0`→`0(sp)`, `a1`→`4(sp)`, and so on; the next tier
covers this layout properly). IDO stores each narrow argument in its slot,
whether or not anything reads it later. It always does this, so this course
calls it the homing ritual.

You can already read the second part of the sequence. The caller did not have
to pass a clean 8-bit value in the 32-bit register, so the function
**re-extends each narrow argument** before it uses it. It uses the signed shift
pair or the unsigned mask, the same truncation idioms as in the last two
lessons, chosen by each parameter's declared type.

Here is why this matters in practice:

- `sw`s into small positive `sp` offsets at the top of a leaf function mean
  **narrow parameters**. This is one of the strongest type oracles there is.
  The number of homing stores even tells you *how many* arguments are narrow.
- Match the re-extension to the type. A shift pair means signed (`s8` or
  `s16`, chosen by the amount). An `andi` means unsigned (`u8` or `u16`,
  chosen by the mask).
- You cannot turn the ritual off, and you do not need to. Declare the types
  that the assembly asks for, and all eight lines come from one `+`.

The target also adds its arguments, but each one is narrow in a *different
way*. Use each argument's re-extension to find its declaration.

## Your task

Write `func_803d2d38` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803d2d38(s16 base, u8 bonus) {
    return base + bonus;
}
```
