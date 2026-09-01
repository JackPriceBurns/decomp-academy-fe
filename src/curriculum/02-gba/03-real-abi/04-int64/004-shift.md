---
id: d53378bd-e8c0-4a63-9366-6653a91d2080
slug: gba-int64-shift
title: Shifting Across the Seam
difficulty: 4
concepts:
  - int64
  - shifts
  - memory
symbol: func_08398e04
hints:
  - The last shift of the funnel is the one that lands in the high half. `lsr`
    there means zeros are shifted in, so the value being shifted is unsigned.
  - One parameter, a `u64 *`, nothing returned. The whole body is a compound
    shift-assign by 4.
---

# The funnel

A shift by less than 32 has to move bits across the boundary between the two
halves, and no single Thumb instruction can do that. The compiler open-codes a
**funnel**: extract the bits that are about to cross with a shift in the
opposite direction by 32 minus the count, shift the half they are heading into,
OR the two pieces together, then shift the remaining half normally.

Here is a left shift by 8:

```asm
0        lsr       r3, r0, #24
2        lsl       r2, r1, #8
4        mov       r1, r3
6        orr       r1, r2
8        lsl       r0, #8
10       bx        lr
```

`lsr r3, r0, #24` is the funnel's whole idea - the top 8 bits of the low half,
pushed down to the bottom of a register, because those are the bits that will
land in the high half. `lsl r2, r1, #8` shifts the high half to make room for
them. `mov r1, r3` / `orr r1, r2` combines the two pieces, one copied into the
destination and the other ORed on top. That copy is why a funnel burns one more
register than the shift count alone would suggest. Finally `lsl r0, #8` shifts
the low half, and zeros arrive at the bottom for free.

A right shift runs the same machinery in reverse, and the shift that finishes
the high half is where the type shows: `lsr` there if the value is unsigned,
`asr` if it is signed, because a signed right shift has to keep copying the sign
bit inward. That single letter is often the only place the signedness of a
64-bit value is visible in a target.

A count of exactly 32 is a special case with no funnel at all:

```asm
0        mov       r1, r0
2        mov       r0, #0
4        bx        lr
```

Nothing is shifted. The high half becomes a copy of the low half, and the low
half becomes zero - a register rename and a `mov`.

Your target's funnel is wrapped in a load and a store, so read the shift counts
and the final shift of the pair before deciding what type you are working with.

## Your task

Write `func_08398e04` to reproduce the target assembly.

<!-- solution -->
```c
void func_08398e04(u64 *p) {
    *p >>= 4;
}
```
