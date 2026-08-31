---
id: 68a253cf-4002-433c-8a13-435155a7ce72
slug: loops-unroll-loads
title: "Unrolled Loads: Reading the Shuffle"
difficulty: 4
concepts:
  - loops
  - unrolling
  - arrays
  - scheduling
symbol: func_8022894c
hints:
  - "Ignore the schedule; inventory the main loop. Four loads, four of the same arithmetic op folding into one accumulator — that's one C line."
  - "The accumulator initializes before the guard and is copied to `v0` at the end. Your `for` reads `arr[i]` and adds; nothing more."
---

# Four of everything, shuffled

Fills were gentle: the unrolled body was four identical stores in a tidy
row. The moment the body *reads* memory and computes, the scheduler
interleaves everything and reading the loop becomes an inventory exercise.
Here's `double_all(arr, n)`, which doubles every element in place — main
loop only, since you know the guard/remainder preamble from last lesson:

```asm
44:  addu  v1, a0, t9      # cursor = arr + i*4
48:  lw    t3, 4(v1)       # ── main loop: load elements i+1, i+2, i+3, i+0
4c:  lw    t5, 8(v1)
50:  lw    t7, 12(v1)
54:  lw    t1, 0(v1)
58:  addiu v1, v1, 16      # bump cursor mid-stream
5c:  sll   t4, t3, 1       # double each one…
60:  sll   t6, t5, 1
64:  sll   t8, t7, 1
68:  sll   t2, t1, 1
6c:  sw    t8, -4(v1)      # …and store each back
70:  sw    t6, -8(v1)
74:  sw    t4, -12(v1)
78:  bne   v1, a2, 0x48    # cursor vs end pointer
7c:  sw    t2, -16(v1)     # (slot) the fourth store
```

Look at the *pattern*, not the order: **four `lw`s, four `sll`s, four
`sw`s**, each quartet using four different scratch registers, offsets
covering `0/4/8/12` (as `-16/-12/-8/-4` after the bump). The loads come
first in a burst — that's the scheduler hiding memory latency — the
arithmetic follows, the stores trail into the branch's slot. Sixteen
instructions; one line of C: each element, load–double–store.

The decompile recipe for any unrolled body:

1. Count how many times the *same* opcode repeats — that's your ×4.
2. Take one representative of each quartet and line them up: `lw` →
   `sll` → `sw` is "read `arr[i]`, shift, write `arr[i]`".
3. Write the naive `for`. Check the remainder loop tells the same story
   one-at-a-time (it always does — it's the honest version).

The target's main loop has the same four-load burst, but the four results
all **fold into a single register** instead of going back to memory — a
running total threading through the quartet. Its remainder loop shows the
per-element op in slow motion, and the total's journey ends in `v0`.

## Your task

Write `func_8022894c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8022894c(s32 *arr, s32 n) {
    s32 total = 0;
    s32 i;
    for (i = 0; i < n; i++) {
        total += arr[i];
    }
    return total;
}
```
