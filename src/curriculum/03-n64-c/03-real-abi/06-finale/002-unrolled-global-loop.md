---
id: 3927cf8b-5534-40ab-a112-ab56e8a32a9d
slug: finale-unrolled-global-loop
title: An Unrolled Loop Over a Global Array
difficulty: 4
concepts:
  - globals
  - loops
  - unrolling
  - hi-lo
  - optimizer
symbol: func_80249f3c
hints:
  - "The loop ends when the moving pointer reaches the second address that was built. Its addend, divided by the element size, is the iteration count."
  - "There are four loads and four combines per iteration, and no counter. This is a ×4 unroll of a one-line accumulation, with the counter turned into a pointer."
---

# A loop that compares two addresses

A counted loop over a global array combines the `%hi`/`%lo` address pattern
with the ×4 unroller. It also adds one new idea: the loop bound becomes an
*address*. Here is `hashInputs()`, which xors together the 12 words of the
global array `gInputs`:

```asm
 0:  lui    a0, %hi(gInputs)
 4:  lui    v0, %hi(gInputs48)
 8:  or     v1, zero, zero          # h = 0
 c:  addiu  v0, v0, %lo(gInputs48)  # the end address, 48 bytes past the base
10:  addiu  a0, a0, %lo(gInputs)    # the moving pointer starts at the base
14:  lw     t6, 0(a0)               # four elements per iteration
18:  lw     t7, 4(a0)
1c:  lw     t8, 8(a0)
20:  xor    v1, t6, v1
24:  lw     t9, 12(a0)
28:  xor    v1, t7, v1
2c:  addiu  a0, a0, 16              # p += four words
30:  xor    v1, t8, v1
34:  bne    a0, v0, 0x14            # loop again if not at the end address yet
38:  xor    v1, t9, v1              # (slot) the fourth xor runs in the delay slot
3c:  or     v0, v1, zero
40:  jr     ra
44:  nop
```

Before the loop, the code builds **two** addresses from the same symbol. One
is the array base. The other is `gInputs48`, the address 48 bytes past the
base. The 48 is an addend attached to the symbol name, the relocation form you
know from the globals chapter. There is no counter register at all. The loop
moves the base pointer up 16 bytes per iteration and compares it with the end
address. The unroller prefers this pointer comparison for a loop whose `i` is
only ever used as `array[i]`.

To recover the C, work out the count first: 48 bytes at 4 bytes per word is 12
elements. Four loads per iteration, at offsets 0/4/8/12, confirm the ×4
unroll. The count 12 divides by 4, and that is *why* the unroller unrolled
this loop. The four interleaved `xor`s all combine into one accumulator, so
the loop body is a single statement. The accumulator starts with
`or v1, zero, zero`, which gives its initial value.

As always with the unroller, your C is the plain four-line `for` loop over a
counter. The compiler turns the counter into a moving pointer by itself, so
you don't write that part.

The target accumulates a different array with a different operation. Read the
addend in its end address first. The rest follows from that.

## Your task

`extern s32 gCoins[8];` is declared for you. Write `func_80249f3c` to
reproduce the target assembly.

<!-- solution -->
```c
s32 func_80249f3c(void) {
    s32 sum = 0;
    s32 i;

    for (i = 0; i < 8; i++) {
        sum += gCoins[i];
    }
    return sum;
}
```

<!-- context -->
```c
extern s32 gCoins[8];
```
