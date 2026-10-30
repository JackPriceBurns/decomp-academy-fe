---
id: 41506957-7957-4439-bba2-d15ae7a8b30a
slug: gba-foundations-literal-pool
title: The Constant Pool
difficulty: 2
concepts:
  - constants
  - literal-pool
  - memory
symbol: poolAdd
hints:
  - The `.word` row at the bottom of the listing is the constant, printed in
    decimal. That is the number your C adds.
  - The compiler produces the `ldr` and the `.hword 0` to load the constant. You
    only write the addition.
---

# A constant stored inside the function

Some numbers cannot be built with a `mov` and a shift, and 100000 is one of
them. No value under 256 shifts up to it, because it is not a small number times
a power of two.

In that case, the compiler does not try to compute the constant. It **stores the
constant in memory, right next to the code**, and then loads it:

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, r1
4        bx        lr
6        .hword    0
8        .word     100000
```

Read this from the bottom up. The `.word 100000` at address 8 is the constant
itself, stored among the instructions as data. The `ldr r1, [pc, #4]` at the
top loads it into `r1` from an address calculated relative to `pc`, the program
counter. The workspace does that calculation for you and prints `(->8)`, which
points at the row the address refers to.

This block of constants is called the **literal pool**, and it is one of the
most recognisable features of ARM code. Values that the instruction set cannot
encode are stored at the end of the function that needs them, and read with a
PC-relative load. You will see literal pools everywhere from now on. The address
of every global variable is loaded in the same way.

The `.hword 0` at address 6 is padding. A `.word` must be at an address that is
a multiple of four. The code before it ended at 6, so the compiler added two
bytes of padding to move the constant to 8. The padding is not an instruction
and it never runs, because the function has already returned at address 4.

Pool constants are shown in decimal, like every other number in this listing.
If the original C wrote its constant in hex, you will need to convert it. Both
forms compile to the same word, so write whichever you prefer.

## Your task

Write `poolAdd`, taking an `s32 x`, to reproduce the target assembly.

<!-- starter -->
```c
s32 poolAdd(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 poolAdd(s32 x) {
    return x + 0x12345;
}
```
