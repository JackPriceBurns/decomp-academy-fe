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
  - "The arithmetic happens first, into a scratch register; the `sw` then pushes that register through the pointer. Read the compute line to see what's being stored."
  - "A void function with a pointer first parameter — the classic out-parameter. One assignment line in the body."
---

# The out-parameter

Last chapter every pointer was something you *read* through. This chapter
turns the arrow around and then spends serious time on the addresses
themselves. First, the write: `sw rt, offset(base)` — **s**tore
**w**ord — copies a register into memory at `base + offset`. Here's
`put_inc`, which delivers `x + 1` through a pointer instead of returning
it:

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

Two things worth pinning down:

- **The value travels through a scratch register.** Memory-to-memory
  doesn't exist; every store is compute-into-register, then `sw`. When
  you read a target, find the store, then trace its register backwards to
  see what was computed.
- **`v0` never appears.** The function is `void` — its result leaves
  through `a0`'s pointee, not the return register. A function whose
  listing has no write to `v0` before `jr ra` returns nothing; the
  pointer parameter is the delivery route. Game code does this
  everywhere: "fill in this struct", "write the answer here".

The target computes one value from its other arguments and stores it
through the first. Read the compute line's mnemonic to see the
operation.

## Your task

Write `func_803e224c` to reproduce the target assembly.

<!-- solution -->
```c
void func_803e224c(s32 *dst, s32 a, s32 b) {
    *dst = a + b;
}
```
