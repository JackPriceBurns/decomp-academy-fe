---
id: 23c7b338-76ec-4430-8613-4d826671209b
slug: gba-division-mod-pow2-signed
title: The Signed Remainder's Long Way Round
difficulty: 4
concepts:
  - division
  - shifts
  - signedness
symbol: func_080b3988
hints:
  - The first three instructions are a divide you met earlier in the chapter.
    Everything after them is the recipe for turning that quotient back into a
    remainder.
  - One `s32` parameter in, an `s32` out — the remainder after dividing by 2.
---

# Four steps and no shortcut

There is no cheap trick for a signed remainder by a power of two. The bottom
bits of a negative number are not its remainder — C wants -9 % 4 to be -1, and
the bottom two bits of -9 are 3 — so gcc computes the thing the definition asks
for, in full:

1. keep a copy of the original value;
2. divide it by the power of two, bias and all;
3. shift the quotient back up by the same amount, which multiplies it back;
4. subtract that product from the copy.

Step one is why so many of these functions open with a `mov` that appears to
achieve nothing. Here is a signed value modulo 4:

```asm
0        mov       r1, r0
2        cmp       r1, #0
4        bge       8 ~>
6        add       r0, r1, #3
8      ~>asr       r0, #2
10       lsl       r0, #2
12       sub       r0, r1, r0
14       bx        lr
```

Eight instructions. `r1` holds the untouched input for the whole function;
addresses 2 to 8 are the divide; `lsl #2` at address 10 multiplies the quotient
back by 4; the `sub` at 12 finishes the job with the original on the left. The
matching `asr`/`lsl` pair with the same amount is the tell — nothing else in
gcc's output shifts a value down and immediately back up.

The unsigned form of the identical expression, for comparison:

```asm
0        mov       r1, r0
2        mov       r0, #3
4        and       r0, r1
6        bx        lr
```

Four instructions against eight, from C that differs by one letter in a
declaration. This is the reason so much GBA code declares its counters `u32`,
and the reason a signed `%` in a per-frame loop is worth flagging when you meet
one.

The four-step recipe is built on top of whichever divide shape the divisor
calls for, so the front of the sequence changes with the constant while the
`lsl`-then-`sub` tail stays put. Read your target's divide first, take the
divisor from it, and the rest of the listing should account for itself.

## Your task

Write `func_080b3988` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080b3988(s32 v) {
    return v % 2;
}
```
