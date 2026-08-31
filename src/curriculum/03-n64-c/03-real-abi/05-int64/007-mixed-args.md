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
  - "The homes at 8 and 12 say the s64 rides `a2`:`a3` — so the s32 must come FIRST in the declaration, and `a1` carries nothing."
  - "After the `sra` builds the missing high half, the payload is the two-ands shape from earlier in the chapter."
---

# When 32-bit and 64-bit arguments share a function

Mix argument sizes and the ABI adds one rule: **a 64-bit argument must start
in an even-numbered register** — `a0` or `a2`, never `a1` or `a3`. Its two
halves also want an 8-byte-aligned home on the stack, and starting even
guarantees it. Here's `scale(n, v)` — an `s32` first, then an `s64`:

```asm
sw     a2, 8(sp)       # v homes into the THIRD and FOURTH slots
sw     a3, 12(sp)
lw     t9, 12(sp)      # v-low
lw     t8, 8(sp)       # v-high
sra    t6, a0, 31      # n widened on the spot: its high half is its sign
addu   v1, a0, t9      # low sum: n + v-low
sltu   at, v1, t9      # the carry, conjured as ever
addu   v0, at, t6      # carry + n's sign…
addu   v0, v0, t8      # …+ v-high
jr     ra
nop
```

Walk the argument registers. `n` takes `a0`. The next free slot is `a1` —
odd, so the `s64` can't start there. It **skips to `a2`:`a3`**, homing at
offsets 8/12, and `a1` arrives carrying *nothing at all*. One 32-bit and
one 64-bit argument, and the four argument registers are spent anyway.

Then last lesson's cast walks in, mid-stream: before `n` can join 64-bit
arithmetic it needs a high half, and there's the lone `sra t6, a0, 31` —
the sign factory — manufacturing it. No homing for `n`, notice: 32-bit
arguments still live in their registers; only the 64-bit ones do the
store/reload dance.

When you meet a mixed-size function in a diff, run this checklist: which
offsets get homed (that places the `s64`), where the `sra`-by-31 is (that
finds the narrow signed value being widened), and *then* read the payload
as ordinary 64-bit code.

The target's payload is one you've already mastered — no carries in this
one.

## Your task

Write `func_80207cd0` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_80207cd0(s32 bits, s64 v) {
    return v & bits;
}
```
