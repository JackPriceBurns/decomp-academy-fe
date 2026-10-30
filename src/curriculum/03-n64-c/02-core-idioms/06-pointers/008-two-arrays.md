---
id: 015d827b-d111-4507-81c1-4ccfc80b849d
slug: pointers-two-arrays
title: "Two Arrays, One Index"
difficulty: 3
concepts:
  - pointers
  - arrays
  - cse
symbol: func_80057608
hints:
  - "There is one `sll` and two `addu`s, because the source and destination addresses share the scaled index. The extra `sll` by 2 near the store is arithmetic on the value, not addressing."
  - "The shape is `dst[i] = something(src[i])`, and the something is a multiply idiom from the arithmetic chapter."
---

# The scaled index gets reused

When code copies between two arrays at the same index, IDO avoids repeating
work. `i * 4` is the same number whether it is added to `src` or to `dst`, so
the compiler computes it **once** and uses one `addu` for each array:

```c
void mirror(s32 *dst, s32 *src, s32 i) {
    dst[i] = src[i];
}
```

```asm
sll   v0, a2, 2     # i * 4, computed once
addu  t6, a1, v0    # &src[i]
lw    t7, 0(t6)     # src[i]
addu  t8, a0, v0    # &dst[i]  (same v0!)
sw    t7, 0(t8)     # dst[i] = …
jr    ra
nop
```

Follow `v0`. One `sll` sets it, and then it feeds *both* `addu`s. This sharing
tells you that the two accesses use the **same index**. Two separate indexes
would each get their own `sll`. Count the shifts, and you know how many
different index expressions the C contains.

Notice also the order: the address of the source, the load, *then* the
address of the destination, and the store. IDO likes to start a load early
(a load takes time to finish) and builds the second address while it waits.
The C is one assignment, and the order of the instructions is up to the
compiler.

The target has the same shape, from source to destination, with one
difference: the value is multiplied by a power of two on the way. You have
built that multiply out of a shift since the warmup. To tell which `sll` is
addressing and which is arithmetic, look at *what feeds it*. If the index
goes in, it is addressing. If a loaded value goes in, it is arithmetic.

## Your task

Write `func_80057608` to reproduce the target assembly.

<!-- solution -->
```c
void func_80057608(s32 *dst, s32 *src, s32 i) {
    dst[i] = src[i] * 4;
}
```
