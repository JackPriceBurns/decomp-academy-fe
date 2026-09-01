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
  - Nothing in this function dereferences the array - the pool word holding it
    is the value being stored, and its addend is part of the expression.
  - "An `s32` in, nothing out. The addend is 8 bytes on a word array, and the `lsl r0, #2` is the part of the subscript the linker could not fold."
---

# An address with a number stuck to it

`&gThing[n]` for a constant `n` is a link-time constant. The linker knows where
`gThing` will land, so it can add `n * sizeof(element)` itself and write the
finished address into a pool word. The function does no arithmetic at all:

```asm
0        ldr       r0, [pc, #0] (->4)
2        bx        lr
4        .word     gQueue20
```

`gQueue20` is a symbol plus a relocation addend, and the workspace prints it
with no separator at all — that row means `gQueue + 20`. On a word array 20
bytes is five elements, so this is `&gQueue[5]`. It reads at first like a symbol
*named* gQueue20; the trailing number is its own field, with nothing in front of
it to say so.

A negative addend does get a sign, which is the one case where the row reads
naturally:

```asm
0        ldr       r0, [pc, #0] (->4)
2        bx        lr
4        .word     gQueue-4
```

To decode any of these: split the row into name and number, divide the number by
the element size, and that is the index. For a struct, map the byte offset to
the field that lives there instead.

Now the part that catches people. When a subscript has a constant part *and* a
variable part, they are handled in different places. The constant part migrates
into the relocation addend, where it costs nothing, and only the variable part
survives as `lsl` and `add` instructions. Two pool rows that look like ordinary
globals can therefore hide a piece of the source expression, and reading only
the instructions will give you an index that is off by a fixed amount.

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
