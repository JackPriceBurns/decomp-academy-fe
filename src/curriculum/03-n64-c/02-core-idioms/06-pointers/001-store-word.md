---
id: 2f889352-4345-422d-aac9-9e4be292c45f
slug: pointers-store-word
title: "sw: Writing Through a Pointer"
difficulty: 1
concepts:
  - pointers
  - stores
symbol: func_803e224c
hints:
  - "The arithmetic happens first and puts its result in a scratch register. Then the `sw` writes that register through the pointer. Read the instruction that computes the value to see what is stored."
  - "It is a void function whose first parameter is a pointer. This is the usual out-parameter pattern. The body is one assignment line."
---

# The out-parameter

In the last chapter, you only *read* through pointers. This chapter starts by
writing through one, and then looks closely at the addresses themselves. The
write instruction is `sw rt, offset(base)`, short for **s**tore **w**ord. It
copies a register into memory at `base + offset`. Here is `put_inc`, which
writes `x + 1` through a pointer instead of returning it:

```c
void put_inc(s32 *out, s32 x) {
    *out = x + 1;
}
```

```asm
addiu t6, a1, 1     # x + 1, computed into scratch
sw    t6, 0(a0)     # *out = the result
jr    ra
nop
```

There are two things to note here:

- **The value goes through a scratch register.** No instruction copies
  memory straight to memory. Every store first computes the value into a
  register, and then `sw` writes that register out. When you read a target,
  find the store, then trace its register backwards to see what was computed.
- **`v0` never appears.** The function is `void`. Its result goes out through
  the memory that `a0` points to, instead of through the return register. If
  a listing never writes to `v0` before `jr ra`, the function returns nothing.
  Here the pointer parameter is how the result gets out. Game code does this
  everywhere, for example "fill in this struct" or "write the answer here".

The target computes one value and stores it through a pointer. Look at the
mnemonic of the instruction that computes the value to see which operation
it is.

## Your task

Write `func_803e224c` to reproduce the target assembly.

<!-- solution -->
```c
void func_803e224c(s32 *dst, s32 a, s32 b) {
    *dst = a + b;
}
```
