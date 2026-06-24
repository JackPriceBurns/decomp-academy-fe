---
id: bitwise-set-flag
title: Setting a Single Flag Bit
difficulty: 2
concepts:
  - bitwise
  - or
  - flags
symbol: set_flag
hints:
  - Setting a flag means OR-ing in its bit and keeping the rest.
  - "`x |= 0x40` is the same as `x = x | 0x40` → one `ori`."
  - 0x40 is a single bit (bit 6), so a power-of-two immediate appears.
  - In real code a lone `ori` with a power-of-two immediate usually means the
    source used a named constant (`#define SOME_FLAG 0x40`); writing the
    constant compiles identically.
---

# The `|=` idiom for flags

Game code is full of flag words where each bit means something — *visible*,
*active*, *dirty*. To **set** one flag you OR in a single-bit mask, usually
written with the compound assignment `x |= mask`.

For example, setting bit 3 (`0x08`) compiles to a single `ori`:

```asm
ori  r3, r3, 8
blr
```

The whole point of `|=` is that it preserves every *other* flag — only the
targeted bit changes. A lone `ori` with a power-of-two immediate is a strong
tell that the original C was `flags |= SOME_FLAG;`.

The target below uses a different flag bit. Identify which power-of-two the
immediate represents, then write the compound assignment that sets it.

```asm
ori  r3, r3, 64
blr
```

## Your task

Write `set_flag` so it compiles to the `ori` above.

<!-- starter -->
```c
u32 set_flag(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 set_flag(u32 x) {
    x |= 0x40;
    return x;
}
```
