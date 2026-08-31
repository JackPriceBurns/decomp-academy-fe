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
  - "Two instructions of real work — an operation, then a sign flip of its result. The `neg.s` reads and writes the same register."
  - "In C that's a minus sign outside a parenthesized product."
---

# Negation is its own instruction

On the integer side, `-x` computes as a subtraction from zero. The
FPU does it more directly: **`neg.s`** flips the sign bit, one
register to another. The bare version:

```asm
neg.s  fv0, fa0     # return -x
jr     ra
nop
```

More interesting is negation *inside* logic. Here's `mag(x)`, the
classic absolute value — `if (x < 0.0f) return -x; return x;`:

```asm
 0:  mtc1   zero, ft0     # 0.0f, free as always
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

The min/max skeleton again — but look at the first `jr`'s delay
slot: instead of a `mov.s`, the *negation itself* rides the return.
Real work in return slots is everywhere in float code; a `jr ra`
whose slot computes is two lines of C, not one.

(There's no dedicated absolute-value shortcut in IDO's repertoire
here — a sign test and a `neg.s` is how `fabs`-style logic actually
lands. When you meet this exact stanza, "absolute value" is the name
of what you're reading.)

The target's negation wraps a *product*: one arithmetic op first,
then the flip, no branching anywhere. Watch which register `neg.s`
takes as its source.

## Your task

Write `func_8035bdc8` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_8035bdc8(f32 a, f32 b) {
    return -(a * b);
}
```
