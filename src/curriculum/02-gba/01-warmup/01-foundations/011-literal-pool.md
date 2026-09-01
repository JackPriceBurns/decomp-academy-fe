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
    decimal - that is the number your C adds.
  - The `ldr` and the `.hword 0` are the compiler's machinery for reaching it;
    you write only the addition.
---

# A constant parked inside the function

Some numbers cannot be reached by a `mov` and a shift. 100000 is one: no value
under 256 shifts up to it, because it is not a small number times a power of two.

When that happens the compiler stops trying to compute the constant and instead
**stores it in memory, right next to the code**, then loads it:

```asm
0        ldr       r1, [pc, #4] (->8)
2        add       r0, r1
4        bx        lr
6        .hword    0
8        .word     100000
```

Read that bottom-up. The `.word 100000` at address 8 is the constant itself,
sitting in the instruction stream as data. The `ldr r1, [pc, #4]` at the top
fetches it: load into `r1` from an address computed relative to `pc`, the
program counter. The workspace helpfully resolves that arithmetic for you and
prints `(->8)`, pointing at the row it lands on.

This block of constants is called the **literal pool**, and it is one of the most
recognisable things about ARM code. Values the instruction set cannot encode get
parked at the end of the function that needs them and fetched with a PC-relative
load. You will see pools everywhere from here on — every global variable's
address arrives the same way.

The `.hword 0` at address 6 is padding. A `.word` has to sit at an address that
is a multiple of four, and the code before it ended at 6, so the compiler
inserted two bytes of nothing to push the constant to 8. It is not an
instruction and it never executes; the function already returned at address 4.

Pool constants print in decimal, like every other number in this listing. If the
original C wrote its constant in hex, you will need to convert — and either
spelling compiles to the same word, so write whichever you prefer.

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
