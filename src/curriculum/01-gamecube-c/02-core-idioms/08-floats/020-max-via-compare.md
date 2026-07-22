---
id: c59334d4-b447-5727-a68c-5007e359a3fa
slug: floats-max-via-compare
title: "Picking the Larger: fcmpo + Conditional fmr"
difficulty: 3
concepts:
  - floating-point
  - fcmpo
  - fmr
  - branch
symbol: select2
hints:
  - The early-return arm is a conditional `blr` (e.g. `bgtlr-`); the fall-through
    `fmr` supplies the other result.
  - Read the branch condition to learn which comparison returns the first
    argument directly.
---

# Selecting one of two floats

Want the larger of two floats? Or the smaller? Either way it is one compare and
one branch. `fcmpo` writes the result of the comparison into the condition
register. Then a *conditional return* looks at that and decides. When the test
holds, one argument is already where the return value lives, so nothing else
happens. When it does not, `fmr` copies the other argument into `f1` and the
`blr` follows.

Take `smaller(p, q)`, handing back whichever value is the lesser one:

```asm
fcmpo cr0, f1, f2    # compare p against q
bltlr-               # if p < q, return p (already in f1)
fmr   f1, f2         # else f1 = q
blr
```

Here is the shape. An `fcmpo`, a `b<cond>lr-` that returns the first argument
while the test holds, and then an `fmr` + `blr` to cover the miss. Everything
hinges on the *condition* glued to that branch. `bltlr` says "return if less
than", which tells you the C `if` compared `p < q`. Don't read anything into the
`-`; it is a static prediction hint and nothing more. And the argument that
happens to be in `f1` at the early return is the one passed back as-is.

Your target is built the same way, `fcmpo` → conditional-`blr` → `fmr`, except
the branch condition is not the same. Decode it, name the comparison, and you
will know which argument leaves by which path.

## Your task

Write `select2` to reproduce the assembly above. Use a plain
`if` with an early `return`.

<!-- solution -->
```c
f32 select2(f32 a, f32 b) {
    if (a > b) return a;
    return b;
}
```
