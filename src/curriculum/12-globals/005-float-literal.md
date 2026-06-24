---
id: globals-float-literal
title: Float Literals Become Pooled Constants
difficulty: 3
concepts:
  - globals
  - sda21
  - literal-pool
  - lfs
  - constants
symbol: scaleHalf
hints:
  - A float literal is pooled into small data under a synthetic label and loaded
    with `lfs`.
  - "`x * 0.5f` becomes `lfs f0, @N@sda21` then `fmuls f1, f0, f1`."
---

# Where does `0.5f` come from?

There's no "load immediate float" instruction, so a literal like `0.5f` can't be
encoded inline. MWCC parks it as an anonymous **pooled constant** in small data
and loads it with `lfs`, just like a named global — except the symbol is a
compiler-generated label such as `@5` rather than a name you wrote:

```asm
lfs   f0, @5@sda21(r2)   # load the pooled constant 0.5f
fmuls f1, f0, f1         # x * 0.5f
blr
```
```
R_PPC_EMB_SDA21   @5
```

That `@5` relocation against an `R_PPC_EMB_SDA21` entry is a **literal pool** load.
Identical machinery to a global float read — the only tell that it's a literal and
not a named global is the synthetic `@N` symbol. When you see an `lfs` of an `@N`
symbol feeding straight into an arithmetic op, the original C had a float
constant in the expression.

## Your task

Write `scaleHalf`, taking an `f32 x` and returning `x * 0.5f`. Use the `0.5f`
literal — the `f` suffix matters. Write `0.5` (a *double*) and MWCC promotes
`x` to double, multiplies in double precision, and converts back: you get
`lfd`/`fmul`/`frsp` instead of the `lfs`/`fmuls` shown above, and the match
fails. Forgetting the suffix is one of the most common real-world causes of a
float mismatch.

<!-- starter -->
```c
f32 scaleHalf(f32 x) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 scaleHalf(f32 x) {
    return x * 0.5f;
}
```
