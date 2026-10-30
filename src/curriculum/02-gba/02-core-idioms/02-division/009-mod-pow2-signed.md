---
id: 23c7b338-76ec-4430-8613-4d826671209b
slug: gba-division-mod-pow2-signed
title: A Signed Remainder Takes Four Steps
difficulty: 4
concepts:
  - division
  - shifts
  - signedness
symbol: func_080b3988
hints:
  - The first three instructions are a divide you met earlier in the chapter.
    Everything after them turns that quotient back into a remainder.
  - One `s32` parameter in, an `s32` out. It returns the remainder after
    dividing by 2.
---

# A remainder in four steps

For a signed remainder by a power of two, there is no cheap method. The bottom
bits of a negative number are not its remainder. C wants -9 % 4 to be -1, but
the bottom two bits of -9 are 3. So gcc computes exactly what the definition
asks for, in full:

1. Keep a copy of the original value.
2. Divide it by the power of two, including the bias.
3. Shift the quotient back up by the same amount, which multiplies it by the
   power of two again.
4. Subtract that product from the copy.

Step one is why so many of these functions start with a `mov` that seems to do
nothing. Here is a signed value modulo 4:

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

That is eight instructions. `r1` holds the unchanged input for the whole
function. Addresses 2 to 8 are the divide. The `lsl #2` at address 10 multiplies
the quotient back by 4. The `sub` at 12 finishes the job, with the original
value on the left. You can recognise this pattern by the `asr`/`lsl` pair with
the same amount. Nothing else in gcc's output shifts a value down and then
straight back up.

For comparison, here is the unsigned form of the same expression:

```asm
0        mov       r1, r0
2        mov       r0, #3
4        and       r0, r1
6        bx        lr
```

That is four instructions against eight, from C that differs by one letter in a
declaration. This is why so much GBA code declares its counters as `u32`. It is
also why a signed `%` in a loop that runs every frame is worth noting when you
find one.

The four steps are built on whichever divide shape the divisor needs. So the
start of the sequence changes with the constant, but the `lsl` followed by `sub`
at the end stays the same. Read your target's divide first and take the divisor
from it. The rest of the listing should then make sense.

## Your task

Write `func_080b3988` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080b3988(s32 v) {
    return v % 2;
}
```
