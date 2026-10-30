---
id: 1748e828-d18a-4c41-bc0f-ac3c0f562e4a
slug: gba-types-load-halfword
title: Loading a Halfword
difficulty: 2
concepts:
  - narrow-types
  - loads
  - addressing
symbol: func_081bb288
hints:
  - Halve each `ldrh` immediate to get back the array subscript that produced it.
  - The function takes one `u16 *` and returns an `s32`. The two elements you
    want are at byte offsets 0 and 14.
---

# Loading two bytes, and how far the offset reaches

`ldrh` is the halfword version of `ldrb`. It reads 16 bits and fills the top
half of the register with zeros. Like `ldrb`, it is a single instruction with
nothing to clean up afterwards. So an unsigned halfword is as cheap to read as
an unsigned byte.

The immediate on `ldrh` is scaled. The instruction has five bits for the
offset, and the hardware multiplies that field by two. This gives a range of 0
to 62 bytes, in steps of two. So `p[3]` on a `u16 *` becomes `[r0, #6]`. To
turn the offsets in a listing back into subscripts, halve them.

That range is small. Here is a function that reads element 3 and element 40 of
the same array:

```asm
0        ldrh      r1, [r0, #6]
2        add       r0, #80
4        ldrh      r0, [r0, #0]
6        sub       r1, r0
8        mov       r0, r1
10       bx        lr
```

Element 3 is 6 bytes from the start, so its offset fits in the load
instruction. Element 40 is 80 bytes from the start, which is more than the
instruction can encode. So the compiler adds 80 to the pointer itself and then
loads at offset zero. When you see an `add` on a pointer followed by a load at
`#0`, the constant in the `add` is the byte offset that did not fit.

The largest subscript that fits is 31:

```asm
0        ldrh      r0, [r0, #62]
2        bx        lr
```

`#62` is the largest immediate `ldrh` can hold. That is why you will never see
`ldrh rD, [rB, #64]` in a GBA binary.

Both loads in your target are within the range that fits in the instruction.
Halve their offsets to get the subscripts.

## Your task

Write `func_081bb288` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081bb288(u16 *p) {
    return p[0] + p[7];
}
```
