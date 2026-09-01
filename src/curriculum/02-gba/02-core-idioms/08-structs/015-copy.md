---
id: 1d789f6b-63b4-45f0-97dd-e135d659ecdd
slug: gba-structs-copy
title: Copying a Struct
difficulty: 4
concepts:
  - structs
  - memory
  - arrays
hints:
  - Two loads grouped together and then two stores is one assignment of a whole
    eight-byte struct. Copying the fields one at a time interleaves them
    instead, and needs more registers.
  - A `struct Bag *` and two `s32` indices in, nothing out. One statement, and
    the only thing you have to work out is which index is the source.
symbol: func_0827b304
---

# One statement, three possible shapes

`*d = *s` on a struct is a memory-to-memory copy, and the compiler picks how to
do it entirely from the size. There are three regimes, and the boundaries are
sharp.

Twelve bytes and up, it uses the load/store-multiple instructions in three-word
blocks:

```asm
0        push      {r4, lr}
2        ldmia     r1!, {r2, r3, r4}
4        stmia     r0!, {r2, r3, r4}
6        pop       {r4}
8        pop       {r0}
10       bx        r0
```

The `!` means write-back: each instruction moves three words and advances its
pointer by twelve. The block is hard-wired to `r2`, `r3`, `r4`, and `r4` is
callee-saved, so a copy of a mere twelve bytes drags a `push {r4, lr}` and the
interworking return into what would otherwise be a leaf function. A prologue
like that on a function that does almost nothing is a struct copy.

Forty-eight bytes is the largest copy it will inline. At 52 it calls the
library:

```asm
0        push      {lr}
2        mov       r2, #52
4        bl        memcpy-4
8        pop       {r0}
10       bx        r0
```

Below twelve bytes there is no multiple at all. Eight bytes is two ordinary
loads and two ordinary stores, with both loads emitted before either store,
because the compiler pulls the whole struct into registers and then puts it
down. That grouping is the tell. Assigning the fields one at a time gives you a
load and a store per field in sequence, a different instruction order, and — in
your target's case — a longer function that has to save a register.

Your target builds two addresses into the same array before it touches memory.
Work out the stride first, then read the four memory instructions in order — the
grouping above is what tells you how many statements produced them.

## Your task

Write `func_0827b304` to reproduce the target assembly.

<!-- context -->
```c
struct Slot2 { u32 item; u32 count; };
struct Bag { struct Slot2 s[4]; };
```

<!-- solution -->
```c
void func_0827b304(struct Bag *b, s32 i, s32 j) {
    b->s[i] = b->s[j];
}
```
