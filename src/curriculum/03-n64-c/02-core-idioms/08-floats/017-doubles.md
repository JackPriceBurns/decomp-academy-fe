---
id: 881c028e-497a-432c-be3c-190e190b36cf
slug: floats-doubles
title: "Doubles: .d and Register Pairs"
difficulty: 2
concepts:
  - floats
  - doubles
  - fpu
symbol: func_80207008
hints:
  - "Read it exactly like the `.s` chain lesson: two ops through `ft0`, and one argument used twice."
  - "Which argument is the second operand of both instructions?"
---

# The same grammar, twice as wide

`f64` (double precision) has its own instruction suffix: **`.d`**. This is
`areaD(w, h)`, which multiplies two doubles:

```asm
mul.d  fv0, fa0, fa1   # w * h
nop
jr     ra
nop
```

This looks almost the same as before: the same registers, the same operand
order, and the same padding `nop` between a multiply and the return. The
differences are not visible in the listing:

- **Each named register is now a *pair*.** A double is 64 bits, and the FPU
  holds it in two neighbouring hardware registers. `fv0` is the `$f0`/`$f1`
  pair, `fa0` is `$f12`/`$f13`, and so on. In `.d` instructions you only name
  the pair, and the second half is implied. (You *can* use the halves
  separately, and the next lesson does that on purpose. The odd half has the
  familiar name plus an `f`, such as `ft0f` or `fv0f`.)
- **Arguments still arrive in `fa0` and `fa1`.** Two doubles fill both
  argument pairs, and a double result is returned in the `fv0` pair.
- The full arithmetic set carries over: `add.d`, `sub.d`, `mul.d`, `div.d`,
  plus `mov.d`, `neg.d` and the `c.lt.d` compare family. They all behave
  exactly like their `.s` versions.

So *reading* double code needs nothing new. Every technique from this chapter
works with the wider suffix. What you should notice is *that* the code uses
doubles. A `.d` in a game function means someone chose doubles, and your C
must use `f64` to reproduce it (or an unsuffixed constant, which is covered
two lessons from now).

The target chains two `.d` operations through a temporary, and one argument
is used twice. Read it from the bottom up, as always.

## Your task

Write `func_80207008` to reproduce the target assembly.

<!-- solution -->
```c
f64 func_80207008(f64 a, f64 b) {
    return (a - b) * b;
}
```
