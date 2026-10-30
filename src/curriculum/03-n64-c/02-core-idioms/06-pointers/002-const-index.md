---
id: decbd763-3ed0-4059-b256-0e5684cf9341
slug: pointers-const-index
title: "Constant Indexes Live in the Offset"
difficulty: 1
concepts:
  - pointers
  - arrays
  - offsets
symbol: func_803b2f5c
hints:
  - "There is one load, one store and no arithmetic. Divide each offset by 4 to get back the two array indexes."
  - "The offset of the load gives the source element, and the offset of the store gives the destination. The body is a single assignment between two slots of the same array."
---

# Divide the offset by the stride

When the index is a constant known at compile time, indexing an array costs
*nothing* extra. The compiler multiplies the index by the element size while
it compiles, and puts the result in the offset field of the load or store. On
an `s32` array, `v[4]` becomes `16(a0)`, with no shift, no add and no extra
instruction. Here is `sum_pair`:

```c
s32 sum_pair(s32 *v) {
    return v[1] + v[4];
}
```

```asm
lw    t6, 16(a0)    # offset 16 / stride 4 = v[4]
lw    t7, 4(a0)     # offset  4 / stride 4 = v[1]
addu  v0, t6, t7
jr    ra
nop
```

To decode an access, use **offset ÷ element size = index**. You will do this
thousands of times. The stride is 4 here because the elements are `s32`. In a
`u8` array the offset is the index itself, and in an `s16` array you halve
the offset to get the index.

Notice also that IDO loaded `v[4]` *before* `v[1]`. The order of the loads
comes from the compiler's scheduling, and it can differ from the order in
your source. The operands of the `addu` follow the order of the loads. You
don't need to change your C for this: the same C always produces the same
order.

One more habit to build now. A single pointer parameter used with several
different offsets usually means an *array*. Keep in mind that a struct looks
exactly the same. You will learn to tell them apart two chapters from now. On
this page, everything is an array.

The target moves a value from one slot of a word array to another. It uses a
load and a store, and each one has an offset for you to decode.

## Your task

Write `func_803b2f5c` to reproduce the target assembly.

<!-- solution -->
```c
void func_803b2f5c(s32 *v) {
    v[1] = v[6];
}
```
