---
id: 23d0572e-425e-463a-a74b-188d6eff8b0e
slug: gba-signatures-no-return
title: A Function That Returns Nothing
difficulty: 2
concepts:
  - calling-convention
  - return-value
  - pointers
symbol: func_0801d288
hints:
  - Nothing is left in r0 at the end, so nothing is returned; r0 is being used as
    an address to store through instead.
  - "A `void` function taking an `s32 *` and two `s32`s, writing their difference through the pointer."
---

# Look at r0 on the way out

You have been assuming every function returns a value. Plenty do not, and the
tell is at the bottom of the listing rather than the top: **whatever is in `r0`
when `bx lr` runs is the return value**, so if the function never puts anything
meaningful there, it does not return anything.

That leaves a question. A function that returns nothing and changes nothing is
pointless, so if the return register is empty, the function must be doing its
work somewhere else — and "somewhere else" means memory. Here is one:

```asm
0        str       r2, [r0, #0]
2        bx        lr
```

`str` is **st**o**r**e: write a register into memory. The operand `[r0, #0]`
means "the address held in `r0`, plus zero" — so `r0` is not a number being
worked on here, it is an **address**. The instruction writes `r2` to the memory
`r0` points at, and then the function returns having left `r0` holding the same
address it arrived with.

That makes the signature readable. Three argument registers are involved, the
first is used as an address, and nothing is returned:

```c
void storeSecond(s32 *p, s32 a, s32 b) {
    *p = b;
}
```

Pointers get a whole chapter of their own later; for now the only thing to take
from this is the reading habit. When you meet a new target, check the last
instruction before `bx lr` first. If it left a computed value in `r0`, the
function returns one. If it stored through a register instead, you are looking at
a `void` function and one of its arguments is an address.

## Your task

Write `func_0801d288` to reproduce the target assembly.

<!-- solution -->
```c
void func_0801d288(s32 *p, s32 a, s32 b) {
    *p = a - b;
}
```
