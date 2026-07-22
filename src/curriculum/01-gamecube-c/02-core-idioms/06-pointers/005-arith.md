---
id: 6bf3da4d-a26c-5e83-a649-70ba485a3760
slug: pointers-arith
title: Pointer Arithmetic Is Scaled
difficulty: 2
concepts:
  - pointers
  - arithmetic
  - scaling
symbol: advancePtr
hints:
  - "Pointer math counts elements, not bytes: `p + 3` is +12 bytes for an int*."
  - "`p + 3` compiles to `addi r3, r3, 12`."
---

# `p + n` is not `+ n`

Pointers count in elements. Add `5` to an `int*` and you don't move 5 bytes, you
move 5 ints. The compiler handles that scaling. It multiplies your offset by
`sizeof(*p)` before anything reaches a register, and for a constant offset the
math finishes at compile time, so the byte count is already baked into the `addi`.

Five elements into an `int` array:

```c
int* advance5(int* p) {
    return p + 5;
}
```

```asm
addi r3, r3, 20   # advance p by 5 * sizeof(int) = 20 bytes
blr
```

An `int` is 4 bytes. Five times 4 is 20, and 20 is what the `addi` carries. Going
backward from the disassembly you flip the operation. Take the immediate, divide
by the element size, and the quotient is how many elements the pointer moved.

Here's a gotcha. `p + n` and `&p[n]` produce byte-identical assembly, since both
land on the nth element's address. The output keeps the secret of which one the
author typed, so just write whichever is easier to read.

So `advancePtr`. What's the immediate on its `addi`, and how many elements does
that work out to?

## Your task

Write `advancePtr` so it compiles to the `addi` above.

<!-- solution -->
```c
int* advancePtr(int* p) {
    return p + 3;
}
```
