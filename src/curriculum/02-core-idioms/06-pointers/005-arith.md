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

# `p + n` is not `+ n`

Adding to a pointer does not add a raw byte count — it advances by **whole
elements**. The compiler multiplies the integer you wrote by `sizeof(*p)` before
it touches a register. For a *constant* offset, that multiplication happens at
compile time and the scaled result is encoded directly in an `addi`.

Here is a function that steps forward five elements in an `int` array:

```c
int* advance5(int* p) {
    return p + 5;
}
```

```asm
addi r3, r3, 20   # advance p by 5 * sizeof(int) = 20 bytes
blr
```

`sizeof(int)` is 4, so 5 elements = 20 bytes, and that number lands directly in
the `addi` immediate. To read this backward from disassembly: take the
immediate, divide by the element size, and you have the element count.

Also note: `p + n` and `&p[n]` compile to identical assembly — both describe
the address of the nth element. You cannot tell from the output which form the
author used; pick whichever reads more naturally in context.

Now look at the target assembly for `advance3`. What immediate does the `addi`
use, and what pointer step does that represent?

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
