---
id: 6bf3da4d-a26c-5e83-a649-70ba485a3760
slug: pointers-arith
title: Pointer Arithmetic Is Scaled
difficulty: 2
concepts:
  - pointers
  - arithmetic
  - scaling
symbol: func_802fcf68
hints:
  - "Pointer math counts elements, not bytes: `p + 3` is +12 bytes for an int*."
  - "`p + 3` compiles to `addi r3, r3, 12`."
---

# `p + n` is not `+ n`

Pointers count in elements. Add `5` to an `int*` and you move 5 ints, not 5 bytes.
The compiler scales the offset by `sizeof(*p)`. For a constant offset, that scaling
happens at compile time, so the byte count is already baked into the `addi`.

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

An `int` is 4 bytes. Five times 4 is 20, and that's what `addi` carries. Going
backward from disassembly, take the immediate and divide by the element size; the
quotient is how many elements the pointer moved.

One note: `p + n` and `&p[n]` produce identical assembly, since both land on the nth
element's address. You can't tell which the author typed, so write whichever reads
better.

So `func_802fcf68`. What's the immediate on its `addi`, and how many elements does
that work out to?

## Your task

Write `func_802fcf68` so it compiles to the `addi` above.

<!-- solution -->
```c
int* func_802fcf68(int* p) {
    return p + 3;
}
```
