---
id: 5fb6309a-31c8-43a1-ba09-94801b139c67
slug: int64-capstone
title: "Capstone: 64 Bits, Assembled"
difficulty: 4
concepts:
  - int64
  - millicode
  - carry
  - capstone
symbol: func_803ed8c0
hints:
  - "Everything after the `jal` operates on the helper's result pair — and it's a three-instruction chain you met at the start of this chapter."
  - "Four homing stores and four reloads into `a0`–`a3` mean both parameters are 64-bit, and both feed the call untouched."
---

# One function, the whole chapter

Time to read a 64-bit function the way you'd meet one in a real game:
several idioms stacked, no labels. First, a worked warm-up that fuses
*mixed arguments*, *widening*, and the *carry chain* — `tally(base, count)`,
an `s64` plus an `s32`:

```asm
sw     a0, 0(sp)       # only the s64 homes — it came first, in a0:a1
sw     a1, 4(sp)
lw     t9, 4(sp)       # base-low
lw     t8, 0(sp)       # base-high
sra    t6, a2, 31      # count's sign, manufactured on the spot
addu   v1, a2, t9      # low sum
sltu   at, v1, t9      # the carry
addu   v0, at, t6      # carry + count's sign…
addu   v0, v0, t8      # …+ base-high
jr     ra
nop
```

Run the checklist and every line files itself: homes at 0/4 place the
`s64` first (in `a0`:`a1`, so no register skipped; the `s32` follows in
`a2`). The lone `sra`-by-31 flags the narrow signed value being widened.
The `addu`/`sltu`/`addu`/`addu` spine is one `+`. Nine instructions,
one line of C.

The target stacks differently. Here's how to attack it — and any 64-bit
function from here on:

1. **Frame first.** If there's a prologue, something inside makes a call —
   and in this chapter, a call means millicode. Find the `jal`; its name
   tells you the operation and the signedness.
2. **Map the homes and reloads.** Which words feed the call, and from
   which parameter slots?
3. **Read past the call.** Whatever touches `v0`:`v1` *after* the `jal`
   is arithmetic applied to the call's result — and by now, every
   post-processing chain you could meet is one you've already named.

Three steps, and a function that once looked like forty lines of noise
becomes a single C expression. Go read it.

## Your task

Write `func_803ed8c0` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_803ed8c0(s64 raw, s64 factor) {
    return raw * factor + 1;
}
```
