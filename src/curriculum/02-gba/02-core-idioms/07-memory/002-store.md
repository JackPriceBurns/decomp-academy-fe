---
id: 7f7641ab-2fa5-4e30-8751-a7e38a1fca70
slug: gba-memory-store
title: Writing Through a Pointer
difficulty: 1
concepts:
  - pointers
  - stores
  - void-returns
symbol: func_081f9ae0
hints:
  - The bracketed operand is always the memory side. Work out which register
    ends up in memory and which one only ever supplies an address.
  - There are two `s32 *` parameters and no return value. The second one is
    read and the first one is written.
---

# Storing is the same instruction backwards

`str` is `ldr` in the other direction. It has the same operands and the same
brackets, and the data moves the opposite way. `str rS, [rB, #0]` writes the
word held in `rS` to the address held in `rB`. Both instructions list the
register first. To read either one, find the brackets: that operand is memory,
and the other one is a register.

A function built around a store usually has nothing to return, and the listing
shows this. Nothing is placed in `r0` before the return. Whatever `r0` contains
at `bx lr` stays there, because the caller of a `void` function never reads it.

```asm
0        str       r2, [r0, #0]
2        neg       r2, r2
4        str       r2, [r1, #0]
6        bx        lr
```

This example has two addresses and a value. `r2` is stored through `r0`,
negated in place, then stored through `r1`. Note that `r0` still holds an
address when the function returns, and this causes no problem. Note also that
nothing is loaded back from memory. The value stays in a register between the
two stores, because the C never reads either location.

The point to remember is that a store leaves no result behind. If you count
what the body produces and find nothing, the return type is `void`. That gives
you part of the signature with no extra work.

Your target reads memory once and writes memory once. Read the brackets to
work out where the value comes from and where it goes.

## Your task

Write `func_081f9ae0` to reproduce the target assembly.

<!-- solution -->
```c
void func_081f9ae0(s32 *dst, s32 *src) {
    *dst = *src + 1;
}
```
