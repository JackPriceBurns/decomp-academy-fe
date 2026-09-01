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
  - Halve each `ldrh` immediate to recover the array subscript that produced it.
  - "One `u16 *` in, an `s32` out, and the two elements you want are the ones at
    byte offsets 0 and 14."
---

# Two bytes at a time, and how far you can reach

`ldrh` is the halfword twin of `ldrb`: it fetches 16 bits and zero-fills the
top half of the register. Like `ldrb` it is a single instruction with nothing to
clean up afterwards, so an unsigned halfword is as cheap to read as an unsigned
byte.

The immediate on `ldrh` is scaled. Five bits of encoding multiplied by two gives
a reach of 0 to 62 bytes, in even steps, so `p[3]` on a `u16 *` becomes
`[r0, #6]`. To turn a listing back into subscripts you halve the offsets.

That reach runs out sooner than you would like. Here is a function reading
element 3 and element 40 of the same array:

```asm
0        ldrh      r1, [r0, #6]
2        add       r0, #80
4        ldrh      r0, [r0, #0]
6        sub       r1, r0
8        mov       r0, r1
10       bx        lr
```

Element 3 is 6 bytes in and rides in the load. Element 40 is 80 bytes in, past
what the instruction can encode, so the compiler adds 80 into the pointer itself
and loads at offset zero. Whenever you see an `add` on a pointer followed by a
load at `#0`, the constant in the `add` is the byte offset that would not fit.

The last subscript that does fit is 31:

```asm
0        ldrh      r0, [r0, #62]
2        bx        lr
```

`#62` is the largest immediate `ldrh` can hold, which is why you will never see
`ldrh rD, [rB, #64]` anywhere in a GBA binary.

Both loads in your target sit within the encodable range. Halve their offsets
and the subscripts fall out.

## Your task

Write `func_081bb288` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081bb288(u16 *p) {
    return p[0] + p[7];
}
```
