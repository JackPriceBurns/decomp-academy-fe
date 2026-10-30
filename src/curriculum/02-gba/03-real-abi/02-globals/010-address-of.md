---
id: 32173300-0a1b-4375-a39f-d56457a85f43
slug: gba-globals-address-of
title: Taking the Address
difficulty: 4
concepts:
  - globals
  - pointers
  - literal-pool
symbol: func_08344268
hints:
  - Nothing in this function dereferences the array. The pool word holding it
    is the value being stored, and its addend is part of the expression.
  - "It takes an `s32` and returns nothing. The addend is 8 bytes on a word array, and the `lsl r0, #2` is the part of the subscript that the linker could not work out ahead of time."
---

# A pool word with a number added to it

`&gThing[n]` for a constant `n` is a link-time constant. The linker knows where
`gThing` will be placed, so it can add `n * sizeof(element)` itself and write
the final address into a pool word. The function does no arithmetic at all:

```asm
0        ldr       r0, [pc, #0] (->4)
2        bx        lr
4        .word     gQueue20
```

`gQueue20` is a symbol plus a relocation addend. The workspace prints the two
with no separator between them, so that row means `gQueue + 20`. On a word
array, 20 bytes is five elements, so this is `&gQueue[5]`. At first it looks
like a symbol *named* gQueue20. The number at the end is a separate field, but
nothing in the row shows where the name ends.

A negative addend is printed with its sign, so in that one case the row is
clear to read:

```asm
0        ldr       r0, [pc, #0] (->4)
2        bx        lr
4        .word     gQueue-4
```

To decode any of these, split the row into a name and a number. Divide the
number by the element size, and the result is the index. For a struct, find the
field at that byte offset instead.

Now a case that people often get wrong. When a subscript has a constant part
*and* a variable part, the two parts are handled in different places. The
constant part moves into the relocation addend, where it costs nothing. Only
the variable part stays in the code, as `lsl` and `add` instructions. So two
pool rows that look like ordinary globals can hold part of the source
expression. If you read only the instructions, your index will be off by a
fixed amount.

Your target stores an address it never loads through.

## Your task

Write `func_08344268` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gSlots[16];
extern s32 *gCursor;
```

<!-- solution -->
```c
void func_08344268(s32 i) {
    gCursor = &gSlots[i + 2];
}
```
