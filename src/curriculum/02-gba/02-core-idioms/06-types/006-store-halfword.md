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
  - The `add` on the pointer belongs to the second store - it is the byte offset
    that would not fit in the instruction. Divide it by two for the subscript.
  - "A `u16 *` followed by two `s32`s, no return value; one store lands at
    subscript 1 and the other at subscript 50."
---

# Sixteen bits kept, sixteen bits dropped

`strh` is the halfword store, and it behaves like `strb` one width up: it writes
the low 16 bits of a register and discards bits 16 to 31. The arithmetic in
front of it runs at full width, and the store is where the value becomes narrow.

Which means that getting at the *upper* half of a value costs an explicit shift.
Here is a function splitting one 32-bit value across two halfwords:

```asm
0        strh      r1, [r0, #0]
2        asr       r1, #16
4        strh      r1, [r0, #8]
6        bx        lr
```

The first `strh` keeps the low half. The `asr #16` slides the high half down
into the low half so the second `strh` can keep that instead. Two stores, one
shift, and no masking - the store discards what the shift left above bit 15.

The offset is scaled by two, exactly like `ldrh`, with the same ceiling of 62:

```asm
0        add       r0, #72
2        strh      r1, [r0, #0]
4        bx        lr
```

Subscript 36 is 72 bytes in, past what the instruction encodes, so the offset
moves into the pointer and the store addresses `#0`. An `add` on the pointer
sitting next to a store at offset zero is always this: a subscript too large for
the addressing mode.

Your target stores two computed values at two subscripts, one of which is well
past the ceiling.

## Your task

Write `func_081c88e4` to reproduce the target assembly.

<!-- solution -->
```c
void func_081c88e4(u16 *p, s32 a, s32 b) {
    p[1] = a + b;
    p[50] = a - b;
}
```
