---
id: 68a253cf-4002-433c-8a13-435155a7ce72
slug: loops-unroll-loads
title: "Unrolled Loads: Reading a Reordered Body"
difficulty: 4
concepts:
  - loops
  - unrolling
  - arrays
  - scheduling
symbol: func_8022894c
hints:
  - "Ignore the order and list what is in the main loop. There are four loads and four of the same arithmetic operation, all combining into one accumulator. That is one line of C."
  - "The accumulator is set up before the guard and copied to `v0` at the end. Your `for` reads `arr[i]` and adds it. Nothing more."
---

# Four of everything, reordered

Fills were simple to read: the unrolled body was four identical stores in a
neat row. As soon as the body *reads* memory and computes something, the
scheduler mixes the instructions together. Reading the loop then means
listing what is there. Here is `double_all(arr, n)`, which doubles every
element in place. Only the main loop is shown, since you know the guard and
remainder code from the last lesson:

```asm
44:  addu  v1, a0, t9      # cursor = arr + i*4
48:  lw    t3, 4(v1)       # ── main loop: load elements i+1, i+2, i+3, i+0
4c:  lw    t5, 8(v1)
50:  lw    t7, 12(v1)
54:  lw    t1, 0(v1)
58:  addiu v1, v1, 16      # bump cursor partway through
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

Look at the *pattern* and ignore the order. There are **four `lw`s, four
`sll`s and four `sw`s**. Each group of four uses four different scratch
registers, and the offsets cover `0/4/8/12` (written as `-16/-12/-8/-4`
after the bump). The loads come first, one after another in a burst, because
the scheduler is hiding memory latency. The arithmetic comes next. The
stores come last, with the final one in the branch's delay slot. That is
sixteen instructions for one line of C: for each element, load, double and
store.

To decompile any unrolled body:

1. Count how many times the *same* opcode repeats. That is your ×4.
2. Take one instruction from each group of four and put them in order:
   `lw` → `sll` → `sw` means "read `arr[i]`, shift, write `arr[i]`".
3. Write the simple `for`. Check that the remainder loop does the same thing
   one element at a time. It always does, because it is the plain version of
   the body, with no unrolling or reordering.

The target's main loop has the same burst of four loads. But the four
results all **combine into a single register** instead of going back to
memory, as a running total that passes through all four. Its remainder loop
shows the same operation one element at a time, and the total ends up in
`v0`.

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
