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

The `off(rA)` form is the **base + displacement** addressing mode you will see
everywhere: a register holding the base address, plus a constant byte offset
encoded directly in the instruction.

Here is a function that reads the second `int` in an array (byte offset 4):

```c
int load_second(int* p) {
    return p[1];
}
```

```asm
lwz  r3, 4(r3)    # fetch word at p + 4 bytes
blr
```

The displacement `4` is the element size times the index. When the offset is
zero the instruction still includes it explicitly — `lwz r3, 0(r3)` — because
the encoding always has a displacement field.

Now look at the target assembly for `load_int`. The function takes one `int*`
and returns an `int`. What displacement does it use, and what does that tell you
about which element is being read?

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
