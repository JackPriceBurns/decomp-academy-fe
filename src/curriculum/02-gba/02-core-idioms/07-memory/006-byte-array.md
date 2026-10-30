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
  - It takes a `u8 *` and an `s32` index, and returns a `u32`. The `mov` at the
    end moves the sum into the register the ABI uses for return values.
---

# The scale that is not there

Scaling an index means multiplying it by the element size. The shift amount is
the base-two logarithm of that size. For an 8-bit element the logarithm is
zero, so the multiply is by one and the shift disappears completely.

Here is the same C pattern on a byte pointer and on a word pointer. Each one
indexes, loads, and adds one:

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

The byte version is one instruction shorter, and the only difference is the
missing `lsl`. Two clues now point to the same conclusion: the load mnemonic is
`ldrb`, and the index went into the `add` without a shift. Both tell you the
elements are 8-bit.

The second clue is more important than it seems. When you see `add r0, r1`
with no shift before it, feeding a load, do not read it as a pointer that was
scaled somewhere else. Read it as an array whose elements are one byte wide. In
the other direction, a plain `add` of two registers followed by `ldrb` is about
as clear a sign of a type as this compiler ever gives.

Bytes also change what the offset field can reach. Its five bits are scaled by
the access size, which is one for `ldrb`. So a byte load can reach offsets 0
to 31, and the next element is at `#1` instead of `#4`.

Your target reads two elements that are next to each other in memory.

## Your task

Write `func_0820b8b0` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0820b8b0(u8 *p, s32 i) {
    return p[i] + p[i + 1];
}
```
