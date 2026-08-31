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

On the GameCube's ABI, the first integer argument arrives in `r3` — the same
register the return value leaves in. That overlap has a funny consequence: some
functions need no instructions at all beyond the return.

```asm
blr
```

One `blr` and that's a complete, valid function. Further integer and pointer
arguments stack up in `r4`, `r5`, `r6`, and so on through `r10`. Floats play by
different rules — they ride in `f1`–`f8` and don't consume an integer slot.

When the assembly is nothing but a `blr`, with nothing touching `r3`, ask
yourself: what would the input and output have to be for the compiler to need
zero work?

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
