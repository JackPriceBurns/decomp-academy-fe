---
id: 3927cf8b-5534-40ab-a112-ab56e8a32a9d
slug: finale-unrolled-global-loop
title: The Unroller Meets a Global Array
difficulty: 4
concepts:
  - globals
  - loops
  - unrolling
  - hi-lo
  - optimizer
symbol: func_80249f3c
hints:
  - "The loop ends when the moving pointer reaches the second built address. Its addend, divided by the element size, is the iteration count."
  - "Four loads and four combines per trip, counter nowhere in sight — a pointerized ×4 unroll of a one-line accumulation."
---

# Two addresses, one loop

A counted loop over a global array fuses the `%hi`/`%lo` machinery with the
×4 unroller — and adds one new trick: the loop bound becomes an *address*.
Here's `hashInputs()`, which xors together the 12 words of the global array
`gInputs`:

```asm
 0:  lui    a0, %hi(gInputs)
 4:  lui    v0, %hi(gInputs48)
 8:  or     v1, zero, zero          # h = 0
 c:  addiu  v0, v0, %lo(gInputs48)  # the END address: 48 bytes past the base
10:  addiu  a0, a0, %lo(gInputs)    # the moving pointer: the base itself
14:  lw     t6, 0(a0)               # ── four elements per trip ──
18:  lw     t7, 4(a0)
1c:  lw     t8, 8(a0)
20:  xor    v1, t6, v1
24:  lw     t9, 12(a0)
28:  xor    v1, t7, v1
2c:  addiu  a0, a0, 16              # p += four words
30:  xor    v1, t8, v1
34:  bne    a0, v0, 0x14            # not at the end address yet? go again
38:  xor    v1, t9, v1              # (slot) the fourth combine rides the slot
3c:  or     v0, v1, zero
40:  jr     ra
44:  nop
```

The pre-loop builds **two** addresses from the same symbol: the array base,
and — via the glued-addend relocation you know from the globals chapter —
`gInputs48`, the address 48 bytes past it. There is no counter register at
all. The loop walks the base pointer up 16 bytes per trip and compares it
against the end address: pointer-versus-pointer, the unroller's favorite
way to run a loop whose `i` is only ever used as `array[i]`.

Recovering the C: 48 bytes at 4 bytes per word is 12 elements; four loads
per trip at offsets 0/4/8/12 confirm the ×4 unroll (and 12 divides by 4,
which is *why* the unroller took the job). The four interleaved `xor`s all
fold into one accumulator, so the body is a single statement, and the
accumulator starting at `or v1, zero, zero` names its initial value.

Your C, as always with the unroller, is the plain four-line `for` loop over
a counter — the pointerization is the compiler's doing, not yours.

The target accumulates a different array with a different operation. Read
its end-address addend first; everything else follows.

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
