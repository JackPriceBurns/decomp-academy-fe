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
  - "One `sll`, two `addu`s — the scaled index is shared between source and destination addresses. The extra `sll` by 2 near the store is value arithmetic, not addressing."
  - "`dst[i] = something(src[i])` — and the something is a multiply idiom
    from the arithmetic chapter."
---

# The scaled index gets reused

Copying between two arrays at the same index is where IDO's economy
shows. `i * 4` is the same number whether it's added to `src` or `dst`,
so the compiler computes it **once** and spends an `addu` per array:

```c
void mirror(s32 *dst, s32 *src, s32 i) {
    dst[i] = src[i];
}
```

```asm
sll   v0, a2, 2     # i * 4 — computed once
addu  t6, a1, v0    # &src[i]
lw    t7, 0(t6)     # src[i]
addu  t8, a0, v0    # &dst[i]  (same v0!)
sw    t7, 0(t8)     # dst[i] = …
jr    ra
nop
```

Follow `v0`: one `sll`, then it feeds *both* `addu`s. That sharing is
your signal that the two accesses use the **same index** — two separate
indexes would each get their own `sll`. Count the shifts, and you know
how many distinct index expressions the C contains.

Notice also the interleaving: address of the source, load, *then*
address of the destination, store. IDO likes to start the load early
(loads take time to land) and build the second address while it waits.
The C is one assignment; the schedule is the compiler's business.

The target is the same source-to-destination shape with one twist: the
value gets scaled up by a power of two on its way across. You've built
that multiply out of a shift since the warmup — spot which `sll` is
addressing and which is arithmetic by *what feeds it*: index in,
addressing; loaded value in, arithmetic.

## Your task

Write `func_80057608` to reproduce the target assembly.

<!-- solution -->
```c
void func_80057608(s32 *dst, s32 *src, s32 i) {
    dst[i] = src[i] * 4;
}
```
