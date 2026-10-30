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
  - Nothing is left in `r0` at the end, so nothing is returned. Instead, `r0` is
    used as an address to store through.
  - "A `void` function that takes an `s32 *` and two `s32` values, and writes their difference through the pointer."
---

# Check r0 at the end

So far you have assumed that every function returns a value. Many do not. You
can tell which kind a function is by looking at the bottom of the listing.
**Whatever is in `r0` when `bx lr` runs is the return value.** If the function
never puts a useful value there, it does not return anything.

A function that returns nothing and changes nothing would be useless. So if the
return register holds no result, the function must do its work some other way,
and that means writing to memory. Here is an example:

```asm
0        str       r2, [r0, #0]
2        bx        lr
```

`str` means **st**o**r**e: write a register to memory. The operand `[r0, #0]`
means "the address held in `r0`, plus zero". So here `r0` holds an **address**,
and the function does no arithmetic with it. The instruction writes `r2` to the
memory that `r0` points to. Then the function returns, and `r0` still holds the
same address it had at the start.

Now you can read the signature. Three argument registers are involved, the
first one holds an address, and nothing is returned:

```c
void storeSecond(s32 *p, s32 a, s32 b) {
    *p = b;
}
```

A later chapter covers pointers in full. For now, the thing to learn from this
is the habit of checking the end. When you see a new target, look first at the
last instruction before `bx lr`. If it left a computed value in `r0`, the
function returns a value. If it stored through a register instead (wrote to the
address that the register holds), the function is `void` and one of its
arguments is an address.

## Your task

Write `func_0801d288` to reproduce the target assembly.

<!-- solution -->
```c
void func_0801d288(s32 *p, s32 a, s32 b) {
    *p = a - b;
}
```
