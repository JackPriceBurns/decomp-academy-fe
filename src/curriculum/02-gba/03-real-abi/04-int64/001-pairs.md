---
id: 712b8e21-f46f-4640-9387-5dbb8e63614a
slug: gba-int64-pairs
title: A Number in Two Registers
difficulty: 3
concepts:
  - int64
  - registers
  - memory
symbol: func_0838b7a8
hints:
  - The stores land at +0, +4, +8 and +12 through one base register. That is two
    64-bit slots, not four loose words.
  - "It takes an `s64` and an `s64 *` and returns nothing: the first slot gets
    the value as it arrived, the second gets it with every bit flipped."
---

# One value, two registers

Every Thumb register is 32 bits wide, so a 64-bit value cannot live in one. The
compiler gives it **two adjacent registers** and treats the pair as a single
object: the low half in the lower-numbered register, the high half in the one
above it. A 64-bit value sitting in `r0` and `r1` has bits 0-31 in `r0` and bits
32-63 in `r1`.

That pairing is what makes the rest of this chapter readable. One instruction
can only touch one half, so every 64-bit operation shows up as **two
instructions on two adjacent registers**, and you have to read the two as one
step.

Memory follows the same order. The GBA is little-endian, so the low half lives
at the lower address: a 64-bit object at `p` keeps bits 0-31 at `p + 0` and bits
32-63 at `p + 4`. Two consecutive 64-bit objects are therefore 8 bytes apart,
and the offsets in the listing are the only place that stride is visible.

Here is a function that loads a 64-bit value out of memory and ORs another one
into it:

```asm
0        push      {r4, lr}
2        mov       r4, r1
4        mov       r3, r0
6        ldr       r0, [r2, #0]
8        ldr       r1, [r2, #4]
10       orr       r0, r3
12       orr       r1, r4
14       pop       {r4}
16       pop       {r2}
18       bx        r2
```

Read it in pairs. `mov r4, r1` / `mov r3, r0` evacuates the incoming pair,
because the result has to come back in `r0:r1` and the loads want those two
registers. `ldr r0, [r2, #0]` / `ldr r1, [r2, #4]` fetches the pair from memory,
low half first. `orr r0, r3` / `orr r1, r4` is a single 64-bit OR - bitwise
operations never move information between the halves, so both halves are
independent and the same instruction is simply issued twice.

The epilogue says the same thing from the other end. `pop {r2}` / `bx r2`
unstacks the return address into `r2` because `r0` **and** `r1` are both
carrying a result.

Your target never gets past this vocabulary: doubled instructions on adjacent
registers, and offsets that walk in fours while the objects they reach walk in
eights. Count them and decide how many 64-bit slots they cover before you write
a line.

## Your task

Write `func_0838b7a8` to reproduce the target assembly.

<!-- solution -->
```c
void func_0838b7a8(s64 v, s64 *p) {
    p[0] = v;
    p[1] = ~v;
}
```
