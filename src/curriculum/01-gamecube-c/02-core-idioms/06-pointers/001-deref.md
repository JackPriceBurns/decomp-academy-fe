---
id: 9dbcae1e-0979-5a26-be1a-82182466374e
slug: pointers-deref
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

A pointer is only an address, sitting in some register. Reading the value it
refers to means issuing a load, and `lwz rD, off(rA)` is the one you will meet
first. Its name unpacks to load word and zero, and it carries the 32-bit word
from `rA + off` over into `rD`.

The `off(rA)` piece is base-plus-displacement addressing, which shows up all over
the place once you start reading disassembly. One register supplies the base
address, and a constant byte offset travels along packed inside the instruction.

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

The `4` there is simply element size scaled by the index. Even a zero offset gets
written in full, the way `lwz r3, 0(r3)` does, because the encoding reserves a
displacement field no matter what.

From there, study the target assembly for `load_int`, a function that accepts a
lone `int*` and returns an `int`. The displacement it carries points straight at
which element it reads.

## Your task

Write `load_int` to match the target assembly above.

<!-- solution -->
```c
int load_int(int* p) {
    return *p;
}
```
