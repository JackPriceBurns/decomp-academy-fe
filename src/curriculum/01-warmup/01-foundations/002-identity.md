---
id: foundations-identity
title: Arguments Live in Registers Too
difficulty: 1
concepts:
  - registers
  - calling-convention
symbol: identity
hints:
  - The argument `x` arrives in r3, which is also the return register.
  - Returning it unchanged needs no work at all — the compiler emits just `blr`.
---

# Where do arguments come from?

The GC ABI passes the first integer argument in **`r3`** — the *same* register
used for the return value. So a function that just returns its argument has
nothing to do: the value is already sitting in `r3`.

```asm
blr              # r3 already holds x — just return
```

That single `blr` is a perfect, if anticlimactic, match. Later integer and
pointer arguments go in `r4`, `r5`, `r6` … up to `r10`. Floating-point
arguments are separate: they use `f1`–`f8` and don't consume an integer
register slot.

## Your task

Write `identity`, which takes an `int x` and returns it unchanged.

<!-- starter -->
```c
int identity(int x) {
    return 0;
}
```

<!-- solution -->
```c
int identity(int x) {
    return x;
}
```
