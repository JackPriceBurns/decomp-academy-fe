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
  - "One load, one store, no arithmetic. Divide each offset by 4 to recover the two array indexes."
  - "The load's offset is the source element, the store's offset is the destination — a single assignment between two slots of the same array."
---

# Divide the offset by the stride

When the index is a compile-time constant, indexing an array costs
*nothing*: the compiler multiplies index by element size at compile time
and bakes the result into the load or store's offset field. `v[4]` on an
`s32` array is just `16(a0)` — no shift, no add, no extra instruction.
Here's `sum_pair`:

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

The decoding move — one you'll make thousands of times — is **offset ÷
element size = index**. Stride 4 here because `s32`; a `u8` array would
put the index in the offset raw, a `s16` array halved. Notice also that
IDO loaded `v[4]` *before* `v[1]`: load order follows the compiler's
scheduling mood, not your source order, and the `addu`'s operands
follow the loads. Don't fight it; the same C produces the same shuffle.

One more habit to build now: a lone pointer parameter with several
different offsets hanging off it usually means *array* — but file away
that a struct will look exactly the same. Telling those apart comes two
chapters from now; on this page, everything is an array.

The target moves a value from one slot of a word array to another —
a load and a store, each with an offset for you to decode.

## Your task

Write `func_803b2f5c` to reproduce the target assembly.

<!-- solution -->
```c
void func_803b2f5c(s32 *v) {
    v[1] = v[6];
}
```
