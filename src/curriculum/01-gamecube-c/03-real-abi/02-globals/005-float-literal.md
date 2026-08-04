---
id: c78ffb82-8459-57ab-9f17-0838b236482a
slug: globals-float-literal
title: Float Literals Become Pooled Constants
difficulty: 3
concepts:
  - globals
  - sda21
  - literal-pool
  - lfs
  - constants
symbol: func_801e3fec
hints:
  - A float literal is pooled into small data under a synthetic label and loaded
    with `lfs`.
  - "`x * 0.5f` becomes `lfs f0, @N@sda21` then `fmuls f1, f0, f1`."
---

# Where does `0.5f` come from?

PowerPC has no load-immediate-float instruction, so a literal like `0.5f` can't
ride inside the encoding. MWCC's workaround is to stash it as an anonymous pooled
constant in small data and load it with `lfs`, exactly like a named global. The
only difference is the symbol: instead of a name you chose, you get a
compiler-minted label like `@5`:

```asm
lfs   f0, @5@sda21(r2)   # load the pooled constant 0.5f
fmuls f1, f0, f1         # x * 0.5f
blr
```
```
R_PPC_EMB_SDA21   @5
```

An `@5` symbol relocated through `R_PPC_EMB_SDA21` is a literal pool load. The
machinery is the same as a global float read, and the only giveaway that it's a
literal is the synthetic `@N` symbol. So when an `lfs` of an `@N` symbol feeds
straight into an arithmetic op, you know the source expression carried a float
constant.

## Your task

Write `func_801e3fec` to reproduce the `lfs`/`fmuls` sequence above. Pay close
attention to literal suffixes — writing a plain `double` literal instead of an
`f32` one causes MWCC to promote `x` to double precision, multiply, then convert
back, producing `lfd`/`fmul`/`frsp` instead of `lfs`/`fmuls`. Forgetting the suffix
is one of the most common real-world causes of a float mismatch.

<!-- solution -->
```c
f32 func_801e3fec(f32 x) {
    return x * 0.5f;
}
```
