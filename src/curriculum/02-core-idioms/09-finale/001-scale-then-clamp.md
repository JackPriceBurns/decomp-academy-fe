---
id: finale-scale-then-clamp
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

The first two chapters gave you the pieces separately: an *affine* expression
(`x * k + c`, built from a `mulli`/`slwi` and an `addi`), and a one-sided
*clamp* (a `cmpwi` whose taken branch returns a fixed bound). A real function
strings them together — do the arithmetic, then keep the result in range.

The trick to reading these is to split the body at the compare. Everything
*before* the `cmpwi` is one expression; the compare and its branch are the cap
bolted on top. Consider `bias_cap(x)`, which doubles a value, biases it, and
holds it under 50:

```asm
slwi  r4,r3,1     # x * 2   (×2 is a shift, not a mulli)
li    r3,50       # speculative: the ceiling
addi  r0,r4,7     # + 7  -> the full affine value in r0
cmpwi r0,50       # is it over the cap?
bgtlr-            # yes -> return r3 (= 50)
mr    r3,r0       # no  -> return the computed value
blr
```

Read it in two halves. The `slwi`+`addi` rebuild `x * 2 + 7`; the multiplier is
a power of two so it strength-reduced to a shift. Then `li 50` parks the ceiling
in the return register *speculatively*, and `bgtlr-` either keeps it (value too
big) or lets `mr r3,r0` overwrite it with the real result.

Your `scale_clamp` has the same two-halves shape, but the scale factor isn't a
power of two — so the multiply shows up as a `mulli`, not a `slwi`. Read the
`mulli` and `addi` to recover the affine expression, then the `cmpwi`/`bgtlr-`
pair to recover the bound and its direction.

## Your task

Write `scale_clamp`, taking one `int`, to reproduce the assembly above.

<!-- starter -->
```c
int scale_clamp(int x) {
    return 0;
}
```

<!-- solution -->
```c
int scale_clamp(int x) {
    int v = x * 3 + 1;
    if (v > 100) return 100;
    return v;
}
```
