---
id: d02f4ae6-deeb-5c45-877e-f778dec97916
slug: globals-scale-narrow-store
title: "Read Wide, Store Narrow"
difficulty: 3
concepts:
  - globals
  - sda21
  - types
  - stb
  - chaining
symbol: func_8000bd28
hints:
  - "`lwz` reads the int global; a `mulli` scales it; the store opcode is the one
    that matches the *destination* global's width."
  - The compiler never masks before a narrow store - `stb` writes only the low
    byte on its own, so the source value's extra bits are simply dropped.
---

# The store width follows the destination, not the source

Read a wide global, do some math, then write the result into a narrower global.
The two memory opcodes come from different types. The load is `lwz` because the
source is an `int`. The store is `stb` (or `sth`) because the *destination* is a
byte (or halfword). Nothing in between narrows the value for you — `stb` already
keeps only the low 8 bits, so the upper part of the computed word is simply
dropped.

It's the same narrow-store rule from the type lesson, except now it follows
arithmetic instead of a plain load. The store opcode tells you the destination's
width, and the load opcode tells you the source's.

Here's `stepPhase()`. It reads the int global `gTicks`, multiplies by a constant,
and drops the low byte into the `u8` global `gPhase`:

```asm
lwz   r0, gTicks@sda21(r13)  # read int global gTicks
mulli r0, r0, 5             # gTicks * 5  (constant multiply, not a power of two)
stb   r0, gPhase@sda21(r13)  # gPhase = (u8) result
blr
```

`mulli` is the general-purpose constant multiply, and 5 isn't a power of two, so
there's no shift to strength-reduce it into. That product fills all of `r0`, yet
`stb` writes back only the low byte to the `u8` global — that's the `(u8)` cast
in hardware. Your target scales a different int global by a different constant
before its own narrow store. The `mulli` immediate and the store opcode are what
you read off it.

## Your task

The globals are already declared: `gRaw` (`int`) and `gLevel` (`u8`). Write
`func_8000bd28` (no arguments, no return) to reproduce the assembly above.

<!-- solution -->
```c
void func_8000bd28(void) {
    gLevel = (u8)(gRaw * 3);
}
```

<!-- context -->
```c
extern int gRaw;
extern u8 gLevel;
```
