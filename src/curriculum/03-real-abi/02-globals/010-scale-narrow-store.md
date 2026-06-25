---
id: globals-scale-narrow-store
title: "Read Wide, Store Narrow"
difficulty: 3
concepts:
  - globals
  - sda21
  - types
  - stb
  - chaining
symbol: clampLevel
hints:
  - "`lwz` reads the int global; a `mulli` scales it; the store opcode is the one
    that matches the *destination* global's width."
  - The compiler never masks before a narrow store - `stb` writes only the low
    byte on its own, so the source value's extra bits are simply dropped.
---

# The store width follows the destination, not the source

When you read a wide global, do some arithmetic, and write the result into a
*narrower* global, the load and store opcodes come from two different types. The
read is `lwz` because the source is an `int`; the write is `stb` (or `sth`)
because the *destination* is a byte (or halfword). There is no separate "narrow
the value" instruction — `stb` already stores only the low 8 bits, so the high
bits of the computed word just fall off the end.

This is the narrow-store rule (`stb`/`sth` from the type lesson) showing up after
some arithmetic instead of after a bare load. Read the *store* opcode to learn
the destination's width; read the *load* opcode to learn the source's.

Consider `stepPhase()`, which reads the int global `gTicks`, multiplies it by a
constant, and stores the low byte into the `u8` global `gPhase`:

```asm
lwz   r0, gTicks@sda21(r13)  # read int global gTicks
mulli r0, r0, 5             # gTicks * 5  (constant multiply, not a power of two)
stb   r0, gPhase@sda21(r13)  # gPhase = (u8) result
blr
```

`mulli` is the general constant multiply (5 isn't a power of two, so it can't
strength-reduce to a shift). The result fills a full word in `r0`, but `stb`
commits only the low byte to the `u8` global — that *is* the `(u8)` cast. The
target assembly scales a different int global by a different constant before its
narrow store. Read the `mulli` immediate and the store opcode.

## Your task

The globals are declared for you: `gRaw` (`int`) and `gLevel` (`u8`). Write
`clampLevel` (no arguments, no return) to reproduce the assembly above.

<!-- starter -->
```c
void clampLevel(void) {
    // read the int global, scale it, store the low byte into the u8 global
}
```

<!-- solution -->
```c
void clampLevel(void) {
    gLevel = (u8)(gRaw * 3);
}
```

<!-- context -->
```c
extern int gRaw;
extern u8 gLevel;
```
