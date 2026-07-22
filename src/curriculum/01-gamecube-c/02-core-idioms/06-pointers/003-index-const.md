---
id: 1d256c0a-476a-58cb-9be4-f49bbc26ab76
slug: pointers-index-const
title: A Constant Index Becomes a Displacement
difficulty: 2
concepts:
  - loads
  - addressing
  - arrays
symbol: elemAt
hints:
  - A constant index folds into the load's displacement — no extra add.
  - "`p[2]` on an int* is byte offset 8, so `lwz r3, 8(r3)`."
---

# The displacement field earns its keep

Index a pointer by a constant and the compiler does the multiplication itself,
ahead of time, tucking the scaled byte offset right into the load's displacement
field. No extra add shows up to do the scaling, because there is nothing left to
scale at runtime.

Take a function that grabs the sixth element of an `int` array:

```c
int sixth(int* p) {
    return p[5];
}
```

```asm
lwz  r3, 20(r3)   # fetch word at p + 20 bytes
blr
```

An `int` is 4 bytes wide, so index 5 works out to a byte offset of `5 * 4 = 20`.
Run that backward and a displacement of `20` on an `int*` comes out as
`20 / 4 = 5`, the sixth element. Dividing the displacement by the element size
like that is the whole trick to reading constant-index accesses straight off a
disassembly.

So look over the target assembly for `elemAt`. Its displacement lands on one
particular element, and dividing by `sizeof(int)` is what tells you which.

## Your task

Write `elemAt` to reproduce the assembly above.

<!-- solution -->
```c
int elemAt(int* p) {
    return p[2];
}
```
