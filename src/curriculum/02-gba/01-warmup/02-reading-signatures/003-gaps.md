---
id: 259d0902-8f2c-46db-ad07-916d128a08c6
slug: gba-signatures-gaps
title: Mind the Gap
difficulty: 2
concepts:
  - calling-convention
  - arguments
symbol: func_08014e60
hints:
  - The two registers being added are not adjacent, so there is a parameter
    between them that the body never touches.
  - "Three `s32` parameters in, an `s32` out — the middle one is declared and ignored."
---

# The argument that leaves no trace

Last lesson's function skipped two of its four arguments and you could still
count them, because `r3` was in the arithmetic. Now look at what happens when the
gap is in the middle:

```asm
0        add       r0, r2
2        bx        lr
```

`r0` and `r2` — the first and third argument registers, with nothing at all
touching `r1`. On some machines an ignored argument still leaves a footprint,
because the compiler parks it in a stack slot on the way in. Not here. This ABI
leaves an unused argument sitting in its register, untouched and unmentioned, so
a skipped parameter is **completely invisible**.

You recover it anyway, from the gap. `r2` is in use, so there are at least three
parameters; `r1` is not, so the second one exists and is ignored:

```c
s32 midGap(s32 a, s32 b, s32 c) {
    return a + c;
}
```

Declaring `b` is not optional. Delete it and `c` becomes the second parameter,
arriving in `r1`, and the `add` would read the wrong register.

## The ones you genuinely cannot see

There is an honest limit here, and it is worth knowing early. A **trailing**
unused argument leaves nothing behind and creates no gap:

```c
s32 trailingUnused(s32 a, s32 b) {
    return a;
}
```

compiles to a bare `bx lr` — exactly what a one-parameter version compiles to.
The original may well have had five ignored arguments after `a` and the assembly
would look identical.

That is fine. Matching is a claim about instructions, and if two signatures
produce the same instructions then either one matches. Declare what the assembly
forces you to declare and no more.

## Your task

Write `func_08014e60` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_08014e60(s32 a, s32 b, s32 c) {
    return c - a;
}
```
