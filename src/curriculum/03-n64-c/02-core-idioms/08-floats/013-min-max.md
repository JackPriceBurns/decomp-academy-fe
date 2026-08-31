---
id: e487db18-c337-4162-9a1c-b403eb54bdb1
slug: floats-min-max
title: "Min and Max: bc1fl and mov.s"
difficulty: 3
concepts:
  - floats
  - compares
  - branch-likely
  - min-max
symbol: func_80121f6c
hints:
  - "Identical skeleton to the worked example — but the `c.lt.s` operands are mirrored. Apply the no-greater-than rule before anything else."
  - "Trace both paths to their `mov.s`. Which argument comes back when the flag is true?"
---

# Pick one of two floats

Clamping a value to a floor — `if (x < lo) return lo; return x;` —
is a two-outcome function, and IDO compiles it with a branch-likely
form and a register copy you haven't met on the FPU yet. Here's
`atLeastW(x, lo)`:

```asm
 0:  c.lt.s fa0, fa1    # flag = (x < lo)
 4:  nop
 8:  bc1fl  0x1c        # flag false (x >= lo)? return…
 c:  mov.s  fv0, fa0    #   (likely slot) …x itself
10:  jr     ra
14:  mov.s  fv0, fa1    # fall-through: return lo
18:  mov.s  fv0, fa0    # duplicated tail — dead, but counted
1c:  jr     ra
20:  nop
```

**`mov.s`** is the FPU's register copy — `or rd, rs, zero`'s cousin.
And the branch is the **likely** form you know from loop back-edges,
doing if-conversion duty: the `mov.s` in its slot runs *only when
the branch is taken*, so each outcome gets its own copy-into-`fv0`.

Trace it both ways. Flag false (`x >= lo`): branch taken, slot runs,
`fv0 = x`, land on the second `jr`. Flag true (`x < lo`): slot
annulled, fall through to the first `jr`, whose delay slot sets
`fv0 = lo`. The `mov.s` at `0x18` is a duplicated tail the optimizer
strands there — unreachable, but part of the byte count, so your C
must produce it too (writing the natural two-return `if` does).

This exact skeleton — compare, `bc1fl`, two `mov.s` returns, one
stray tail — is how the game spells every float min, max, floor, and
ceiling against a variable. Which *one* it is lives entirely in the
compare's mnemonic and operand order.

The target caps a value against a *ceiling* instead. Remember what
this instruction set doesn't have.

## Your task

Write `func_80121f6c` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_80121f6c(f32 x, f32 hi) {
    if (x > hi) {
        return hi;
    }
    return x;
}
```
