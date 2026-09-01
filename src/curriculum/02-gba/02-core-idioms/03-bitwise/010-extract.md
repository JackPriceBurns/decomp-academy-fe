---
id: de3194c5-d3b3-46af-a47d-5828ee57c981
slug: gba-bitwise-extract
title: Pulling a Field Out
difficulty: 3
concepts:
  - shifts
  - bitfields
  - register-allocation
symbol: func_080f6a98
hints:
  - Two shift pairs, so two fields come out of the same incoming word. Run the
    width and low-bit arithmetic on each pair separately before you write
    anything.
  - One `u32` argument and a `u32` result. Both fields are pulled from that one
    argument with shift pairs, and the two results are added.
---

# Two shifts are a field

Thumb has no bitfield-extract instruction and no rotate-and-mask, so gcc 2.9
isolates a run of bits the only way it can: shift the field up until its top bit
is at bit 31, then shift it back down to bit 0. Everything outside the field
falls off one end or the other.

```asm
0        lsl       r0, #22
2        lsr       r0, #26
4        bx        lr
```

Two numbers, and they decode mechanically. The right shift tells you the
**width**: 32 minus 26 is 6 bits. The difference tells you the **low bit**: 26
minus 22 is 4. So that function extracts the 6-bit field sitting at bits 4
through 9, and in C it is written as a left shift by 22 followed by a right
shift by 26 — the same two numbers you just read.

Get in the habit of doing that arithmetic before anything else. `lsl #20` then
`lsr #27` is 5 bits at bit 7. `lsl #16` then `lsr #16` is 16 bits at bit 0.
`lsl #1` then `lsr #31` is a single bit at bit 30.

The obvious alternative spelling produces different code:

```asm
0        lsr       r0, #6
2        mov       r1, #15
4        and       r0, r1
6        bx        lr
```

That is a shift down followed by a mask. Same field, same value, three
instructions and a constant instead of two instructions and none. gcc 2.9 never
rewrites one form into the other — the shift pair is its canonical
zero-extension and it keeps opposite-direction shifts exactly as written — so
the listing tells you unambiguously which spelling the original author used.
Reach for a mask when you see a mask, and for a shift pair when you see a shift
pair.

When two fields come out of the same word, the first shift needs a copy of the
original to work from. That is the three-operand `lsl` from earlier in the
chapter, and it is your signal that the source word is about to be used again.

## Your task

Write `func_080f6a98` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_080f6a98(u32 v) {
    return ((v << 18) >> 29) + ((v << 24) >> 28);
}
```
