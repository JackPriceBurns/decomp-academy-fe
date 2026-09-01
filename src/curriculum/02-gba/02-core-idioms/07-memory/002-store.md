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
  - Two `s32 *` parameters and no return value — the second one is read, the
    first one is written.
---

# Storing is the same instruction backwards

`str` is `ldr` with the traffic reversed: same operands, same brackets,
opposite direction. `str rS, [rB, #0]` writes the word held in `rS` to the
address held in `rB`. The register that is written comes first in both
mnemonics, so the way to read either one is to find the brackets — that
operand is memory, the other is a register.

A function built around a store usually has nothing to hand back, and the
listing shows it. Nothing is placed in `r0` before the return; whatever `r0`
happens to contain at `bx lr` is left there, because the caller of a `void`
function never looks.

```asm
0        str       r2, [r0, #0]
2        neg       r2, r2
4        str       r2, [r1, #0]
6        bx        lr
```

Two addresses and a value. `r2` is stored through `r0`, negated in place, then
stored through `r1`. Notice that `r0` still holds an address when the function
returns and nobody minds. Notice too that nothing is ever loaded back: the
value stays in a register between the two stores, because the C never asks to
read either location.

The pattern to take away is that a store leaves no result behind. When you
count what the body produced and come up empty, the return type is `void` —
which is a piece of the signature you get for free.

Your target reads memory once and writes memory once. Read the brackets to
work out where the value comes from and where it lands.

## Your task

Write `func_081f9ae0` to reproduce the target assembly.

<!-- solution -->
```c
void func_081f9ae0(s32 *dst, s32 *src) {
    *dst = *src + 1;
}
```
