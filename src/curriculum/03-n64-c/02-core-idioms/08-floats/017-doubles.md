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
  - "Read it exactly like the `.s` chain lesson — two ops through `ft0`, one argument used twice."
  - "Which argument rides in the second slot of both instructions?"
---

# The same grammar, twice as wide

`f64` — double precision — gets its own instruction suffix: **`.d`**.
Here's `areaD(w, h)`, multiplying two doubles:

```asm
mul.d  fv0, fa0, fa1   # w * h
nop
jr     ra
nop
```

Familiar to the point of anticlimax: same registers, same operand
order, same mul-before-return pad. The differences hide under the
hood:

- **Each named register is now a *pair*.** A double is 64 bits, and
  the FPU holds it across two adjacent hardware registers — `fv0` is
  the `$f0`/`$f1` pair, `fa0` is `$f12`/`$f13`, and so on. In `.d`
  instructions you only ever name the pair; the second half is
  implicit. (The halves *can* be touched individually — next lesson
  does it on purpose — and the odd half shows up under the name
  `ft0f`, `fv0f`: the familiar name plus an `f`.)
- **Arguments still arrive in `fa0` and `fa1`** — two doubles fill
  both argument pairs, and a double result leaves in the `fv0` pair.
- The full arithmetic set carries over: `add.d`, `sub.d`, `mul.d`,
  `div.d`, plus `mov.d`, `neg.d`, and the `c.lt.d` compare family,
  all behaving exactly like their `.s` twins.

So *reading* double code costs you nothing new — every technique
from this chapter applies with a wider suffix. What you should
notice is *that* it's double: a `.d` in a game function is a choice
somebody made, and your C must say `f64` (or an unsuffixed constant
— that story in two lessons) to reproduce it.

The target chains two `.d` operations through a temporary, one
argument pulling double shifts. Bottom-up, as ever.

## Your task

Write `func_80207008` to reproduce the target assembly.

<!-- solution -->
```c
f64 func_80207008(f64 a, f64 b) {
    return (a - b) * b;
}
```
