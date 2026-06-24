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

When you index a pointer with a *constant*, like `p[2]`, the compiler folds the
offset straight into the displacement field of the load. There's no separate
add. Since each `int` is 4 bytes, element 2 lives at byte offset `2 * 4 = 8`:

```asm
lwz  r3, 8(r3)    # r3 = p[2]
blr
```

This is the first place **element size** shows up: the C index `2` becomes the
byte displacement `8`. Reading disassembly, you divide back — a displacement of
`8` on an `int*` means index `2`.

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
