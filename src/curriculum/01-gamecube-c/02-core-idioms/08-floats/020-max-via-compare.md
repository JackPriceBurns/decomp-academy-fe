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
symbol: func_80164cd0
hints:
  - The early-return arm is a conditional `blr` (e.g. `bgtlr-`); the fall-through
    `fmr` supplies the other result.
  - Read the branch condition to learn which comparison returns the first
    argument directly.
---

# Selecting one of two floats

Want the larger of two floats? Or the smaller? Either way it's one compare and one
branch. `fcmpo` writes the comparison result into the condition register. Then a
conditional return looks at that and decides. If the test holds, one argument is
already where the return value lives, so nothing else happens. If not, `fmr` copies
the other argument into `f1` and `blr` follows.

Take `smaller(p, q)`, returning the lesser value:

```asm
fcmpo cr0, f1, f2    # compare p against q
bltlr-               # if p < q, return p (already in f1)
fmr   f1, f2         # else f1 = q
blr
```

Here's the shape: `fcmpo`, a `b<cond>lr-` that returns the first argument while
the test holds, then `fmr` + `blr` for the miss. Everything hinges on the condition
on that branch. `bltlr` means "return if less than", so the C compared `p < q`.
Don't read anything into the `-`; it's a static prediction hint. The argument in
`f1` at the early return is the one passed back as-is.

Your target is built the same way: `fcmpo` → conditional-`blr` → `fmr`, but with a
different branch condition. Decode it, name the comparison, and you'll know which
argument leaves by which path.

## Your task

Write `func_80164cd0` to reproduce the assembly above. Use a plain `if` with an
early `return`.

<!-- solution -->
```c
f32 func_80164cd0(f32 a, f32 b) {
    if (a > b) return a;
    return b;
}
```
