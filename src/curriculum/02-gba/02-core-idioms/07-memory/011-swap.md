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
    register holds, and the C follows from that.
  - It takes two `s32 *` arguments and returns nothing. One temporary must stay
    live across a store, which is why the loads come as a pair.
---

# Everything loads before anything stores

A swap is two loads and two stores, and the data decides their order. Writing
either slot destroys the value that the other write still needs. So both reads
must finish before the first write happens. The listing reads load, load,
store, store.

The registers matter as much as the order. A register that holds an address
the code still needs cannot also hold a loaded value. So the values being moved
go into whichever scratch registers the arguments left free.

With a third slot, you can see this register pressure:

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

This is a three-way rotation: the first slot's value moves to the last slot,
and each other value moves down one slot. The value loaded into `r4` on line 2
is not stored until line 12, five instructions later. So it has to stay in a
register that no other work will change. `r2` and `r3` are already in use, so
gcc takes `r4`. `r4` is callee-saved, so the function, which would otherwise be
a leaf, gains a `push {r4, lr}` and the interworking epilogue.

Note also that by the time the code loads from the third address in `r2`, `r0`
is free again. The compiler reuses that argument register for the value being
moved. A register is reused as soon as its last use has passed.

Your target uses the same idea on a shorter cycle. It never needs a
callee-saved register, so everything fits in `r0` to `r3` with no `push` at
all.

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
