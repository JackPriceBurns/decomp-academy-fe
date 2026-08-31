---
id: 9dbcae1e-0979-5a26-be1a-82182466374e
slug: pointers-deref
title: Dereferencing a Pointer
difficulty: 1
concepts:
  - loads
  - pointers
  - memory
symbol: func_8036f2b8
hints:
  - The pointer arrives in r3; reading through it is a load.
  - "`*p` compiles to `lwz r3, 0(r3)`."
---

# Reading from memory

A pointer is just an address in a register. Reading the value it points to
means issuing a load. The first one you'll see is `lwz rD, off(rA)`: load word
and zero, copying the 32-bit word at `rA + off` into `rD`.

`off(rA)` is base-plus-displacement addressing, and it shows up everywhere in
disassembly. One register holds the base address; a constant byte offset is
packed into the instruction.

Below, a small function pulls the second `int` out of an array, four bytes past
the start:

```c
int load_second(int* p) {
    return p[1];
}
```

```asm
lwz  r3, 4(r3)    # fetch word at p + 4 bytes
blr
```

The `4` is the element size scaled by the index. Even a zero offset gets
written out fully, like `lwz r3, 0(r3)`, because the instruction encoding
always has a displacement field.

Now look at the target assembly for `func_8036f2b8`. The displacement tells you
exactly which element it reads.

## Your task

Write `func_8036f2b8` to match the target assembly.

<!-- solution -->
```c
int func_8036f2b8(int* p) {
    return *p;
}
```
