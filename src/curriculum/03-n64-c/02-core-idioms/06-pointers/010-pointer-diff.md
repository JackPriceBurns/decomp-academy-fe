---
id: b2bb95e1-b790-4190-9799-91ce31449de3
slug: pointers-diff
title: "Subtracting Pointers Hides a Divide"
difficulty: 3
concepts:
  - pointers
  - arithmetic
  - shifts
symbol: func_800aee54
hints:
  - "A `subu` is followed by an arithmetic right shift, which divides the byte distance down to an element count. The shift amount gives the element size."
  - "The first source operand of the `subu` is the pointer being subtracted *from*, so match your parameter order to it. The whole function is one return of a pointer difference."
---

# `end - start`, in elements

In C you can subtract two pointers of the same type. The result is the number
of *elements* between them, not the number of bytes. The hardware only works
in bytes, so the compiler subtracts the raw addresses and then divides by the
element size. When the size is a power of two, that divide is the signed
shift you learned in the arithmetic chapter:

```c
s32 hw_gap(s16 *a, s16 *b) {
    return a - b;
}
```

```asm
subu  v0, a0, a1    # raw byte distance
sra   t6, v0, 1     # ÷ 2: elements, not bytes
or    v0, t6, zero
jr    ra
nop
```

A `subu` of two incoming pointers that feeds an `sra` is the whole pattern.
It tells you two things:

- **The `sra` amount gives the element size**, in the same way as the
  indexing `sll`: shift 1 means halfwords, and shift 2 means words. In this
  chapter, the shift that scales an index up and the shift that scales a
  difference down use the same amounts.
- **It is `sra`, not `srl`.** A pointer difference is *signed*
  (`ptrdiff_t`), because `a - b` is negative when `a` is below `b`. You saw
  the same reasoning, `sra` for a signed divide, with `/ 2`. Here the
  compiler applies it for you.

You saw something similar in the loops chapter, where a `subu` of two
pointers produced the length of a span. On its own, this pattern is usually
a small helper like the target, which counts how many elements lie between
two pointers into the same array.

## Your task

Write `func_800aee54` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800aee54(s32 *end, s32 *start) {
    return end - start;
}
```
