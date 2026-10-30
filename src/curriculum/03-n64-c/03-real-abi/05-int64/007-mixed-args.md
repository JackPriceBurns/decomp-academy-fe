---
id: 781f347a-f392-4462-82ea-218b336ea149
slug: int64-mixed-args
title: The Skipped Register
difficulty: 3
concepts:
  - int64
  - abi
  - alignment
  - sign-extension
symbol: func_80207cd0
hints:
  - "The home slots at 8 and 12 show that the s64 is in `a2`:`a3`. So the s32 must come FIRST in the declaration, and `a1` holds nothing."
  - "After the `sra` builds the missing high half, the rest is the pattern with two AND instructions from earlier in the chapter."
---

# When 32-bit and 64-bit arguments share a function

When a function mixes argument sizes, the ABI adds one rule: **a 64-bit
argument must start in an even-numbered register**. That means `a0` or `a2`,
never `a1` or `a3`. Its two halves also need an 8-byte-aligned home on the
stack, and starting in an even register guarantees that. Here is
`scale(n, v)`, which takes an `s32` first and then an `s64`:

```asm
sw     a2, 8(sp)       # v homes into the THIRD and FOURTH slots
sw     a3, 12(sp)
lw     t9, 12(sp)      # v-low
lw     t8, 8(sp)       # v-high
sra    t6, a0, 31      # n widened here: its high half is its sign
addu   v1, a0, t9      # low sum: n + v-low
sltu   at, v1, t9      # the carry, computed as before
addu   v0, at, t6      # carry + n's sign…
addu   v0, v0, t8      # …+ v-high
jr     ra
nop
```

Go through the argument registers in order. `n` takes `a0`. The next free
register is `a1`, which is odd, so the `s64` cannot start there. It **skips to
`a2`:`a3`** and is homed at offsets 8/12. `a1` arrives holding *nothing at
all*. With one 32-bit and one 64-bit argument, all four argument registers
are used anyway.

Next, the widening cast from earlier in the chapter appears in the middle of
the code. Before `n` can take part in 64-bit arithmetic, it needs a high half,
and the lone `sra t6, a0, 31` builds it from the sign bit. Notice also that
`n` is not homed. 32-bit arguments still stay in their registers. Only the
64-bit ones are stored and reloaded.

When you meet a function with mixed argument sizes in a diff, use this
checklist. First, see which offsets are homed, which tells you where the `s64`
is. Next, find the `sra` by 31, which shows you the narrow signed value being
widened. *Then* read the rest as ordinary 64-bit code.

The main operation in the target is one you have already practised, and it
has no carries.

## Your task

Write `func_80207cd0` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_80207cd0(s32 bits, s64 v) {
    return v & bits;
}
```
