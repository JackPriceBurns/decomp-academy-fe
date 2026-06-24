---
id: pointers-index-const
title: A Constant Index Becomes a Displacement
difficulty: 2
concepts:
  - loads
  - addressing
  - arrays
symbol: third
hints:
  - A constant index folds into the load's displacement — no extra add.
  - "`p[2]` on an int* is byte offset 8, so `lwz r3, 8(r3)`."
---

# The displacement field earns its keep

When you index a pointer with a *constant*, the compiler folds the scaled byte
offset straight into the displacement field of the load. There is no separate
add instruction — the scaling happens at compile time.

Here is a function that reads the sixth element of an `int` array:

```c
int sixth(int* p) {
    return p[5];
}
```

```asm
lwz  r3, 20(r3)   # fetch word at p + 20 bytes
blr
```

`sizeof(int)` is 4, so index 5 maps to byte offset `5 * 4 = 20`. Reading it in
reverse: a displacement of `20` on an `int*` means `20 / 4 = 5`, the sixth
element. That conversion — divide the displacement by the element size — is the
core skill for reading constant-index accesses from disassembly.

Look at the target assembly for `third`. The displacement it uses points at a
specific element; divide by `sizeof(int)` to find which one.

## Your task

Write `third` to reproduce the assembly above.

<!-- starter -->
```c
int third(int* p) {
    return 0;
}
```

<!-- solution -->
```c
int third(int* p) {
    return p[2];
}
```
