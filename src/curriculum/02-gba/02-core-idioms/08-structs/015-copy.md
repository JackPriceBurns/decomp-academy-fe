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
    eight-byte struct. Copying the fields one at a time interleaves the loads
    and stores instead, and needs more registers.
  - The function takes a `struct Bag *` and two `s32` indices, and returns
    nothing. It is one statement, and the only thing you have to work out is
    which index is the source.
symbol: func_0827b304
---

# One statement, three possible patterns

`*d = *s` on a struct is a memory-to-memory copy. The compiler chooses how to
do it based only on the size. There are three cases, and the size limits
between them are exact.

For twelve bytes and more, it uses the load-multiple and store-multiple
instructions, in blocks of three words:

```asm
0        push      {r4, lr}
2        ldmia     r1!, {r2, r3, r4}
4        stmia     r0!, {r2, r3, r4}
6        pop       {r4}
8        pop       {r0}
10       bx        r0
```

The `!` means write-back: each instruction moves three words and then adds
twelve to its pointer. The block always uses `r2`, `r3` and `r4`, and `r4` is
callee-saved. So even a copy of only twelve bytes adds a `push {r4, lr}` and
the interworking return to what would otherwise be a leaf function. If you see
a prologue like that on a function that does almost nothing else, it is a
struct copy.

Forty-eight bytes is the largest copy the compiler will inline. At 52 bytes it
calls the library:

```asm
0        push      {lr}
2        mov       r2, #52
4        bl        memcpy-4
8        pop       {r0}
10       bx        r0
```

Below twelve bytes, there is no load-multiple at all. Eight bytes is copied
with two ordinary loads and two ordinary stores. Both loads come before either
store, because the compiler reads the whole struct into registers and then
writes it out. That grouping is how you recognise a struct copy. If you assign
the fields one at a time, you get a load and a store for each field in turn.
That gives a different instruction order and, in your target's case, a longer
function that has to save a register.

Your target builds two addresses into the same array before it accesses
memory. Work out the stride first. Then read the four memory instructions in
order. The grouping described above tells you how many statements produced
them.

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
