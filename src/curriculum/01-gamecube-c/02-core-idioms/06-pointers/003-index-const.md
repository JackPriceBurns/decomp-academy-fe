---
id: 1d256c0a-476a-58cb-9be4-f49bbc26ab76
slug: pointers-index-const
title: A Constant Index Becomes a Displacement
difficulty: 2
concepts:
  - loads
  - addressing
  - arrays
symbol: func_803495b0
hints:
  - A constant index folds into the load's displacement — no extra add.
  - "`p[2]` on an int* is byte offset 8, so `lwz r3, 8(r3)`."
---

# The displacement field earns its keep

Index a pointer by a constant and the compiler does the scaling itself, baking
the byte offset into the load's displacement. No extra add appears at runtime.

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

An `int` is 4 bytes, so index 5 gives byte offset `5 * 4 = 20`. Run that
backward: a displacement of `20` on an `int*` means `20 / 4 = 5`, the sixth
element. Dividing the displacement by the element size is the trick to reading
constant-index accesses in disassembly.

Look at the target assembly for `func_803495b0`. Its displacement points to one
element; divide by `sizeof(int)` to find which.

## Your task

Write `func_803495b0` to reproduce the assembly above.

<!-- solution -->
```c
int func_803495b0(int* p) {
    return p[2];
}
```
