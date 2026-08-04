---
id: 1bf47bd6-dfc1-51d1-b4bb-05d009b8eb23
slug: foundations-identity
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

On the GC ABI, the first integer argument arrives in `r3`. That's the same
register the return value goes back in. The overlap has a funny consequence: a
few functions give the compiler nothing to emit beyond the return instruction.

```asm
blr
```

One `blr`, and that's a whole valid function. Further integer and pointer
arguments stack up in `r4`, `r5`, `r6`, and so on through `r10`. Floats play by
different rules, riding in `f1`–`f8` without consuming an integer slot.

When the assembly is only a `blr` with nothing touching `r3`, ask yourself: what
would the input and output have to be for no work to be needed at all?

## Your task

Write `identity`, taking an `int x`, to reproduce the assembly above.

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
