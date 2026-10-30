---
id: 29440044-f6db-4c13-b666-723c3220f779
slug: gba-types-store-halfword
title: Storing a Halfword
difficulty: 2
concepts:
  - narrow-types
  - stores
  - addressing
symbol: func_081c88e4
hints:
  - The `add` on the pointer belongs to the second store. Its constant is the
    byte offset that did not fit in the instruction. Divide it by two to get the
    subscript.
  - The arguments are a `u16 *` followed by two `s32`s, and there is no return
    value. One store writes subscript 1 and the other writes subscript 50.
---

# The halfword store keeps the low sixteen bits

`strh` is the halfword store. It works like `strb`, but for the next size up.
It writes the low 16 bits of a register and discards bits 16 to 31. The
arithmetic before it runs at full width, and the value only becomes narrow at
the store.

This means that storing the *upper* half of a value needs an explicit shift.
Here is a function that splits one 32-bit value across two halfwords:

```asm
0        strh      r1, [r0, #0]
2        asr       r1, #16
4        strh      r1, [r0, #8]
6        bx        lr
```

The first `strh` stores the low half. The `asr #16` moves the high half down
into the low half, so the second `strh` can store it. That is two stores and one
shift, with no masking. The store discards whatever the shift left above bit 15.

The offset is scaled by two, as with `ldrh`, and has the same limit of 62:

```asm
0        add       r0, #72
2        strh      r1, [r0, #0]
4        bx        lr
```

Subscript 36 is 72 bytes from the start, which is more than the instruction can
encode. So the offset is added to the pointer, and the store uses `#0`. An `add`
on the pointer next to a store at offset zero always means the same thing: the
subscript was too large for the addressing mode.

Your target stores two computed values at two subscripts. One of them is well
past the limit.

## Your task

Write `func_081c88e4` to reproduce the target assembly.

<!-- solution -->
```c
void func_081c88e4(u16 *p, s32 a, s32 b) {
    p[1] = a + b;
    p[50] = a - b;
}
```
