---
id: 35fe24eb-6dc8-4357-ab0b-f01dda5cc6b4
slug: gba-memory-swap
title: Swapping Two Slots
difficulty: 3
concepts:
  - pointers
  - loads
  - stores
symbol: func_08221df4
hints:
  - Both loads happen before either store. Work out which value each stored
    register is carrying and the C writes itself.
  - Two `s32 *` in, nothing out. One temporary has to survive across a store,
    which is why the loads come out in a pair.
---

# Everything loads before anything stores

A swap is two loads and two stores, and the order they come out in is forced
by the data. Writing either slot destroys the value the other write still
needs, so both reads have to be finished before the first write happens. The
listing reads load, load, store, store.

The registers matter as much as the order. A register holding an address that
is still needed cannot double as a home for a loaded value, so the values in
transit go to whichever scratch registers the arguments left free.

Add a third slot and the pressure becomes visible:

```asm
0        push      {r4, lr}
2        ldr       r4, [r0, #0]
4        ldr       r3, [r1, #0]
6        str       r3, [r0, #0]
8        ldr       r0, [r2, #0]
10       str       r0, [r1, #0]
12       str       r4, [r2, #0]
14       pop       {r4}
16       pop       {r0}
18       bx        r0
```

This is a three-way rotation: the first slot's value moves to the last, and
everything else shifts down. The value loaded into `r4` on line 2 is not stored
until line 12, five instructions later, so it has to live somewhere that no
other work will disturb. `r2` and `r3` are already spoken for, so gcc takes
`r4` — which is callee-saved, so the function that would otherwise have been a
leaf grows a `push {r4, lr}` and the interworking epilogue.

Notice also that once the third address in `r2` is loaded from, `r0` is free
again, and the compiler reuses the argument register for the value in transit.
Registers are recycled the moment their last use is behind them.

Your target runs the same idea on a shorter cycle. It never reaches for a
callee-saved register, so the whole thing fits between `r0` and `r3` with no
`push` at all.

## Your task

Write `func_08221df4` to reproduce the target assembly.

<!-- solution -->
```c
void func_08221df4(s32 *a, s32 *b) {
    s32 t = *a;
    *a = *b;
    *b = t;
}
```
