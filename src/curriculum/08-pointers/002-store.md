---
id: pointers-store
title: Storing Through a Pointer
difficulty: 1
concepts:
  - stores
  - pointers
  - memory
symbol: store_int
hints:
  - Writing through a pointer is a store; the value is in r4.
  - "`*p = v` compiles to `stw r4, 0(r3)` — source register first."
---

# Writing to memory

The mirror image of a load is a **store**. `stw rS, off(rA)` — *store word* —
writes the 32-bit value in `rS` to the address `rA + off`. Note the operand
order: the *source register comes first*, the address second — the reverse of
how you read `*p = v` in C.

With the pointer in `r3` and the value in `r4`:

```asm
stw  r4, 0(r3)    # *p = v
blr
```

A store produces no result, so the function just returns. The same
base + displacement addressing mode from the load applies here too.

## Your task

Write `store_int` so it compiles to the `stw` above.

<!-- starter -->
```c
void store_int(int* p, int v) {
}
```

<!-- solution -->
```c
void store_int(int* p, int v) {
    *p = v;
}
```
