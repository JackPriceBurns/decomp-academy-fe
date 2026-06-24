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
writes the 32-bit value in `rS` to the address `rA + off`.

Two things to notice about the operand order: the *source register* (`rS`) comes
first, and the address (`off(rA)`) comes second. This is the reverse of how you
read a C assignment left-to-right. In `stw r4, 4(r3)`, register `r4` holds the
value being written and `r3` holds the base address.

Here is a function that writes to the second element of an array:

```c
void write_second(int* p, int v) {
    p[1] = v;
}
```

```asm
stw  r4, 4(r3)    # write v to p + 4 bytes
blr
```

A store produces no result, so there is nothing to return — the function just
falls through to `blr`. The same base + displacement addressing mode used by
loads applies here too.

Now look at the target assembly for `store_int`. What displacement is used, and
which registers carry the pointer and the value?

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
