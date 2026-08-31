---
id: 3dea9be4-9b87-5be3-8d73-1e1cbbd5db44
slug: bitwise-set-flag
title: Setting a Single Flag Bit
difficulty: 2
concepts:
  - bitwise
  - or
  - flags
symbol: func_8037aa6c
hints:
  - Setting a flag means OR-ing in its bit and keeping the rest.
  - "`x |= 0x40` is the same as `x = x | 0x40` → one `ori`."
  - 0x40 is a single bit (bit 6), so a power-of-two immediate appears.
  - In real code a lone `ori` with a power-of-two immediate usually means the
    source used a named constant (`#define SOME_FLAG 0x40`); writing the
    constant compiles identically.
---

# The `|=` idiom for flags

Game code overflows with flag words — every bit standing for some piece of
state: *visible*, *active*, *dirty*. Setting one of those flags means OR-ing in
a single-bit mask, and in C that almost always shows up as the compound
assignment `x |= mask`.

Set bit 3 (the mask `0x08`) and it collapses to one `ori`:

```asm
ori  r3, r3, 8
blr
```

The reason `|=` works is that it leaves every *other* flag where it was — only
the bit you aimed at moves. So when you spot a lone `ori` carrying a
power-of-two immediate, the source behind it was almost certainly
`flags |= SOME_FLAG;`.

The target below sets a different flag. Work out which power of two the
immediate stands for, then write the compound assignment that flips it on.

```asm
ori  r3, r3, 64
blr
```

## Your task

Write `func_8037aa6c` so it compiles to the `ori` above.

<!-- solution -->
```c
u32 func_8037aa6c(u32 x) {
    x |= 0x40;
    return x;
}
```
