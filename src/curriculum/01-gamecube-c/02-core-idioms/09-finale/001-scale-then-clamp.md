---
id: 0bbf3d70-8806-5e3b-b78e-06360c68b907
slug: finale-scale-then-clamp
title: "Scale, Then Clamp"
difficulty: 2
concepts:
  - finale
  - arithmetic
  - clamp
  - control
symbol: scale_clamp
hints:
  - The arithmetic runs first and lands in a scratch register; only then does the
    compare decide whether to cap it.
  - "The cap is delivered the `bgtlr-` way — a speculative `li` of the bound, with
    `mr` passing the computed value through when it's under the limit."
---

# Two chapters in one function

Up to now you've seen these two ideas on their own. An *affine* expression,
`x * k + c`, falls out of a `mulli` (or a `slwi`) and an `addi`. A one-sided
*clamp* is a `cmpwi` whose taken branch returns some fixed bound. The thing is,
working code rarely keeps them separate. It computes a value and then pins that
value inside a range, all in the same handful of instructions.

So where does one idea end and the next begin? At the compare. Everything before
the `cmpwi` builds a single expression; the `cmpwi` and the branch riding behind
it are the cap. Take `bias_cap(x)`, which doubles its input, biases it, and keeps
the answer below 50:

```asm
slwi  r4,r3,1     # x * 2   (×2 is a shift, not a mulli)
li    r3,50       # speculative: the ceiling
addi  r0,r4,7     # + 7  -> the full affine value in r0
cmpwi r0,50       # is it over the cap?
bgtlr-            # yes -> return r3 (= 50)
mr    r3,r0       # no  -> return the computed value
blr
```

So, two halves. `slwi` plus `addi` give you `x * 2 + 7` — the multiply became a
shift only because the factor was a power of two. The clever bit is `li 50`, which
loads the ceiling into `r3` early, on spec, well before the compare runs. `bgtlr-`
is what decides. Too big? The 50 you stashed is already the answer. Otherwise `mr
r3,r0` drops the computed value in over it.

`scale_clamp` is the same machine with one part swapped. Its factor isn't a power
of two, so the multiply stays a `mulli` and never folds down to a shift. Read off
the expression from that `mulli` and the `addi`, then let `cmpwi`/`bgtlr-` give
you the bound and the direction of the clamp.

## Your task

Write `scale_clamp` to reproduce the assembly above.

<!-- solution -->
```c
int scale_clamp(int x) {
    int v = x * 3 + 1;
    if (v > 100) return 100;
    return v;
}
```
