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
  - "Same structure as the worked example, but the `c.lt.s` operands are mirrored. Apply the mirror rule (there is no greater-than compare) before anything else."
  - "Trace both paths to their `mov.s`. Which argument comes back when the flag is true?"
---

# Pick one of two floats

Clamping a value to a floor, as in `if (x < lo) return lo; return x;`, gives
a function with two possible results. IDO compiles it with a branch-likely
instruction and an FPU register copy you have not seen yet. This is
`atLeastW(x, lo)`:

```asm
 0:  c.lt.s fa0, fa1    # flag = (x < lo)
 4:  nop
 8:  bc1fl  0x1c        # flag false (x >= lo)? return…
 c:  mov.s  fv0, fa0    #   (likely slot) …x itself
10:  jr     ra
14:  mov.s  fv0, fa1    # fall-through: return lo
18:  mov.s  fv0, fa0    # duplicated tail: never runs, but still counted
1c:  jr     ra
20:  nop
```

**`mov.s`** is the FPU's register copy. It does the same job as
`or rd, rs, zero` on the integer side. The branch is the **likely** form you
know from loop back-edges, used here for if-conversion. The `mov.s` in its
delay slot runs *only when the branch is taken*, so each outcome gets its own
copy into `fv0`.

Trace both paths. When the flag is false (`x >= lo`), the branch is taken,
the slot runs and sets `fv0 = x`, and execution lands on the second `jr`.
When the flag is true (`x < lo`), the slot is annulled (skipped). Execution
falls through to the first `jr`, whose delay slot sets `fv0 = lo`. The
`mov.s` at `0x18` is a duplicated tail that the optimizer leaves behind. It
can never run, but it is part of the byte count, so your C must produce it
too. (The natural `if` with two returns does.)

The game uses this exact structure for every float min, max, floor and
ceiling against a variable: a compare, `bc1fl`, two `mov.s` returns and one
unused tail. Which of the four it is depends only on the compare's mnemonic
and operand order.

The target limits a value to a *ceiling* instead. Remember which compare this
instruction set does not have.

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
