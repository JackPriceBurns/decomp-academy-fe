---
id: 5fb6309a-31c8-43a1-ba09-94801b139c67
slug: int64-capstone
title: "Capstone: Reading a Whole 64-bit Function"
difficulty: 4
concepts:
  - int64
  - millicode
  - carry
  - capstone
symbol: func_803ed8c0
hints:
  - "Everything after the `jal` works on the helper's result pair. It is a chain of three instructions that you met at the start of this chapter."
  - "Four homing stores and four reloads into `a0` to `a3` mean both parameters are 64-bit, and both go into the call unchanged."
---

# One function that uses the whole chapter

Now read a 64-bit function the way you would find one in a real game, with
several idioms combined and no labels. First, a worked warm-up that combines
*mixed arguments*, *widening* and the *carry chain*. `tally(base, count)` adds
an `s64` and an `s32`:

```asm
sw     a0, 0(sp)       # only the s64 homes. It came first, in a0:a1
sw     a1, 4(sp)
lw     t9, 4(sp)       # base-low
lw     t8, 0(sp)       # base-high
sra    t6, a2, 31      # count's sign, built here
addu   v1, a2, t9      # low sum
sltu   at, v1, t9      # the carry
addu   v0, at, t6      # carry + count's sign…
addu   v0, v0, t8      # …+ base-high
jr     ra
nop
```

Run the checklist and every line makes sense. The homes at 0/4 show that the
`s64` comes first (in `a0`:`a1`, so no register is skipped, and the `s32`
follows in `a2`). The lone `sra` by 31 marks the narrow signed value being
widened. The `addu`/`sltu`/`addu`/`addu` chain is one `+`. Nine instructions
do the work of one line of C.

The target is put together differently. Here is how to approach it, and any
64-bit function from now on:

1. **Start with the frame.** If there is a prologue, something inside makes a
   call, and in this chapter a call means millicode. Find the `jal`. Its name
   tells you the operation and the signedness.
2. **Map the homes and reloads.** Which words go into the call, and from which
   parameter slots?
3. **Read past the call.** Whatever uses `v0`:`v1` *after* the `jal` is
   arithmetic on the call's result. By now, every chain you could meet after
   the call is one you have already seen.

These three steps turn a function that once looked like forty lines of noise
into a single C expression. Now read the target.

## Your task

Write `func_803ed8c0` to reproduce the target assembly.

<!-- solution -->
```c
s64 func_803ed8c0(s64 raw, s64 factor) {
    return raw * factor + 1;
}
```
