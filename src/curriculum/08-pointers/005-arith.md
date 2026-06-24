---
id: pointers-arith
title: Pointer Arithmetic Is Scaled
difficulty: 2
concepts:
  - pointers
  - arithmetic
  - scaling
symbol: advance3
hints:
  - "Pointer math counts elements, not bytes: `p + 3` is +12 bytes for an int*."
  - "`p + 3` compiles to `addi r3, r3, 12`."
---

# `p + 3` is not `+ 3`

Adding to a pointer doesn't add a raw number — it advances by **whole
elements**. For an `int*`, `p + 3` moves forward `3 * 4 = 12` bytes. With a
*constant* offset MWCC folds the scaled distance into an `addi`:

```asm
addi r3, r3, 12   # p + 3, scaled by sizeof(int)
blr
```

The result is the new address, returned in `r3`. This is why `p + 3` and
`&p[3]` are the same thing: both produce the address `p + 12 bytes`. The element
size silently multiplies every pointer offset you write. The decompilation
implication: since both forms emit identical assembly, you *can't* tell from the
output which one the author wrote — pick whichever reads more naturally in
context (`&arr[i]` for array-shaped data, `p + n` for pointer walks).

## Your task

Write `advance3` so it compiles to the `addi` above.

<!-- starter -->
```c
int* advance3(int* p) {
    return p;
}
```

<!-- solution -->
```c
int* advance3(int* p) {
    return p + 3;
}
```
