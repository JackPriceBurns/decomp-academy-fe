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
  - The stores go to +0, +4, +8 and +12 through one base register. Read them as
    two 64-bit slots, each one covering two of the four words.
  - "It takes an `s64` and an `s64 *` and returns nothing. The first slot gets
    the value unchanged, and the second gets it with every bit flipped."
---

# One value, two registers

Every Thumb register is 32 bits wide, so a 64-bit value cannot fit in one. The
compiler gives it **two adjacent registers** and treats the pair as a single
object. The low half goes in the lower-numbered register, and the high half goes
in the one above it. A 64-bit value in `r0` and `r1` has bits 0-31 in `r0` and
bits 32-63 in `r1`.

You need this pairing to read the rest of this chapter. One instruction can only
work on one half, so every 64-bit operation appears as **two instructions on two
adjacent registers**. Read the two instructions together as one step.

Memory uses the same order. The GBA is little-endian, so the low half is stored
at the lower address. A 64-bit object at `p` keeps bits 0-31 at `p + 0` and bits
32-63 at `p + 4`. Two 64-bit objects in a row are therefore 8 bytes apart. The
offsets in the listing are the only place where you can see that spacing.

Here is a function that loads a 64-bit value from memory and ORs another one
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

Read it in pairs. `mov r4, r1` / `mov r3, r0` moves the incoming pair out of the
way. The result has to come back in `r0:r1`, and the loads need those two
registers. `ldr r0, [r2, #0]` / `ldr r1, [r2, #4]` loads the pair from memory,
low half first. `orr r0, r3` / `orr r1, r4` is a single 64-bit OR. Bitwise
operations never move information between the halves, so the two halves are
independent and the compiler issues the same instruction twice.

The epilogue shows the same thing from the other end. `pop {r2}` / `bx r2` pops
the return address into `r2`, because `r0` **and** `r1` both hold the result.

Your target uses only these patterns: doubled instructions on adjacent
registers, and offsets that go up in fours while the objects they reach go up in
eights. Count the offsets and work out how many 64-bit slots they cover before
you write any code.

## Your task

Write `func_0838b7a8` to reproduce the target assembly.

<!-- solution -->
```c
void func_0838b7a8(s64 v, s64 *p) {
    p[0] = v;
    p[1] = ~v;
}
```
