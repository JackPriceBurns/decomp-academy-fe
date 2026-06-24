---
id: pointers-deref
title: Dereferencing a Pointer
difficulty: 1
concepts:
  - loads
  - pointers
  - memory
symbol: load_int
hints:
  - The pointer arrives in r3; reading through it is a load.
  - "`*p` compiles to `lwz r3, 0(r3)`."
---

# Reading from memory

A pointer is just an address sitting in a register. To read the value it points
at, PowerPC uses a **load**: `lwz rD, off(rA)` — *load word and zero* — fetches
the 32-bit word at `rA + off` into `rD`.

With the pointer arriving in `r3` and an offset of zero, `*p` is a single load:

```asm
lwz  r3, 0(r3)    # r3 = *p
blr
```

The `0(r3)` is the **base + displacement** addressing mode you'll see
everywhere: a register holding an address, plus a constant byte offset. Here the
displacement is `0` because we want the very first word.

## Your task

Write `load_int` to match the target assembly above.

<!-- starter -->
```c
int load_int(int* p) {
    return 0;
}
```

<!-- solution -->
```c
int load_int(int* p) {
    return *p;
}
```
