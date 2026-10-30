---
id: 2d6f7242-2499-4916-a87f-26f5037b412e
slug: floats-negate
title: "neg.s: Flipping the Sign"
difficulty: 2
concepts:
  - floats
  - negation
symbol: func_8035bdc8
hints:
  - "Two instructions do the real work: an operation, then a sign flip of its result. The `neg.s` reads and writes the same register."
  - "In C that's a minus sign outside a parenthesized product."
---

# Negation is its own instruction

On the integer side, `-x` is computed as a subtraction from zero. The FPU
does it more directly: **`neg.s`** flips the sign bit while copying from one
register to another. The simplest case looks like this:

```asm
neg.s  fv0, fa0     # return -x
jr     ra
nop
```

Negation *inside* logic is more interesting. This is `mag(x)`, the standard
absolute value, `if (x < 0.0f) return -x; return x;`:

```asm
 0:  mtc1   zero, ft0     # 0.0f, no lui needed, as always
 4:  nop
 8:  c.lt.s fa0, ft0      # x < 0.0f ?
 c:  nop
10:  bc1fl  0x24          # not negative? return…
14:  mov.s  fv0, fa0      #   (likely slot) …x as-is
18:  jr     ra
1c:  neg.s  fv0, fa0      # negative path: -x, in the return's slot
20:  mov.s  fv0, fa0      # dup tail
24:  jr     ra
28:  nop
```

This is the min/max structure again, but look at the delay slot of the first
`jr`. It holds the *negation itself* instead of a `mov.s`, so the negation
runs as the function returns. Float code often does real work in return
delay slots. A `jr ra` whose slot computes something stands for two lines of
C.

(IDO does not use a dedicated absolute value shortcut here. A sign test and a
`neg.s` is how `fabs`-style logic compiles. When you see this exact block,
you are reading an absolute value.)

The target's negation wraps a *product*. There is one arithmetic operation
first, then the sign flip, and no branches. Check which register `neg.s` uses
as its source.

## Your task

Write `func_8035bdc8` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8035bdc8(f32 a, f32 b) {
    return -(a * b);
}
```
