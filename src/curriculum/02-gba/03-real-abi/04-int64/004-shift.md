---
id: d53378bd-e8c0-4a63-9366-6653a91d2080
slug: gba-int64-shift
title: Shifting Bits Between Halves
difficulty: 4
concepts:
  - int64
  - shifts
  - memory
symbol: func_08398e04
hints:
  - The last shift of the funnel is the one that finishes the high half. An
    `lsr` there shifts in zeros, so the value being shifted is unsigned.
  - It takes one parameter, a `u64 *`, and returns nothing. The whole body is
    one compound shift assignment by 4.
---

# The funnel

A shift by less than 32 has to move some bits across the boundary between the
two halves, and no single Thumb instruction can do that. The compiler writes the
shift out inline as a sequence called a **funnel**. First it extracts the bits
that are about to cross, using a shift in the opposite direction by 32 minus the
count. Next it shifts the half those bits are moving into. Then it ORs the two
pieces together. Finally it shifts the other half normally.

Here is a left shift by 8:

```asm
0        lsr       r3, r0, #24
2        lsl       r2, r1, #8
4        mov       r1, r3
6        orr       r1, r2
8        lsl       r0, #8
10       bx        lr
```

`lsr r3, r0, #24` is the key step of the funnel. It moves the top 8 bits of the
low half down to the bottom of a register, because those are the bits that will
end up in the high half. `lsl r2, r1, #8` shifts the high half to make room for
them. `mov r1, r3` / `orr r1, r2` combines the two pieces: one is copied into
the destination, and the other is ORed into it. Because of that copy, a funnel
uses one more register than the shift alone seems to need. Finally,
`lsl r0, #8` shifts the low half, and zeros fill the bottom bits without any
extra instruction.

A right shift uses the same steps in the other direction. The shift that
finishes the high half shows the type. It is `lsr` if the value is unsigned and
`asr` if it is signed, because a signed right shift has to keep copying the sign
bit in from the top. That one letter is often the only place in a target where
you can see whether a 64-bit value is signed.

A count of exactly 32 is a special case with no funnel:

```asm
0        mov       r1, r0
2        mov       r0, #0
4        bx        lr
```

Nothing is shifted. The high half becomes a copy of the low half, and the low
half becomes zero. That is a register copy and a `mov`.

In your target, the funnel sits between a load and a store. Read the shift
counts and the final shift of the pair before you decide what type you are
working with.

## Your task

Write `func_08398e04` to reproduce the target assembly.

<!-- solution -->
```c
void func_08398e04(u64 *p) {
    *p >>= 4;
}
```
