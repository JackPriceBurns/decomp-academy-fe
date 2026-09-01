---
id: 2a3abdde-eda6-4b63-a6dd-a68372ec5e38
slug: gba-memory-byte-array
title: Byte Arrays Need No Scaling
difficulty: 2
concepts:
  - pointers
  - arrays
  - narrow-types
symbol: func_0820b8b0
hints:
  - No shift in front of the `add` means the element size is one. The second
    load's offset is in the same units.
  - A `u8 *` and an `s32` index in, a `u32` out. The `mov` at the end is the
    compiler moving the sum into the register the ABI returns in.
---

# The scale that is not there

Scaling an index means multiplying it by the element size, and the shift
amount is the base-two logarithm of that size. For an 8-bit element that
logarithm is zero, so the multiply is by one and the shift disappears
completely.

Here is the same C shape on a byte pointer and on a word pointer — index,
load, add one:

```asm
0        add       r0, r1
2        ldrb      r0, [r0, #0]
4        add       r0, #1
6        bx        lr
```

```asm
0        lsl       r1, #2
2        add       r1, r0
4        ldr       r0, [r1, #0]
6        add       r0, #1
8        bx        lr
```

The byte version is one instruction shorter and the difference is entirely the
missing `lsl`. Two clues are now pointing at the same conclusion: the load
mnemonic is `ldrb`, and the index went into the `add` unshifted. Both say
8-bit elements.

That second clue matters more than it looks. When you see `add r0, r1` with no
shift in front of it, feeding a load, do not read it as a pointer that was
scaled somewhere else — read it as an array whose elements are one byte wide.
And in the other direction, a bare `add` of two registers followed by `ldrb` is
about as unambiguous as this compiler ever gets about a type.

Bytes also change what the offset field can reach. Its five bits are scaled by
the access size, which for `ldrb` is one, so a byte load addresses 0 to 31 — a
neighbouring element sits at `#1`, not `#4`.

Your target reads two elements that are adjacent in memory.

## Your task

Write `func_0820b8b0` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0820b8b0(u8 *p, s32 i) {
    return p[i] + p[i + 1];
}
```
