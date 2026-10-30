---
id: 7646838f-e7bb-414f-9451-bf1a1c4bcaad
slug: opt-unroll-const
title: The ×4 Unroller
difficulty: 3
concepts:
  - optimizer
  - loops
  - unrolling
  - arrays
symbol: func_80191a0c
hints:
  - "There are two pointers, and each trip has four loads and four stores. The counter's limit and its step per trip tell you the total element count."
  - "Both pointers advance by 16 in the middle of the loop body, so the later accesses use negative offsets. They still reach the same elements. Only the offset arithmetic has moved. Write the plain loop."
---

# Four iterations in each trip

Branches cost cycles, so at `-O2` IDO **unrolls** counted loops: each trip
through the machine loop does *four* iterations of your C loop. Here is
`sum16(p)`, which sums the 16 words at `p`:

```asm
 0:  or     a1, a0, zero     # the pointer is copied to a1…
 4:  or     v1, zero, zero   # sum = 0
 8:  addiu  a0, zero, 16     # …a0 is repurposed as the trip limit
 c:  or     v0, zero, zero   # i = 0
10:  lw     t6, 0(a1)        # ── loop: four elements per trip ──
14:  lw     t7, 4(a1)
18:  lw     t8, 8(a1)
1c:  addu   v1, v1, t6
20:  lw     t9, 12(a1)
24:  addu   v1, v1, t7
28:  addiu  v0, v0, 4        # i += 4, not 1
2c:  addu   v1, v1, t8
30:  addiu  a1, a1, 16       # p advances four words
34:  bne    v0, a0, 0x10
38:  addu   v1, v1, t9       # the fourth add goes in the delay slot
3c:  or     v0, v1, zero
40:  jr     ra
44:  nop
```

How to read an unrolled loop:

- **Count the memory operations per trip.** Here there are four `lw`s, at
  offsets 0/4/8/12. Then check the counter: `i += 4`. Four accesses and a step
  of four mean one C iteration, unrolled ×4.
- **Recover the real trip count.** The limit is 16 and the step is 4. Each
  machine trip is four C iterations, so the *C* loop runs 16 times. The unroller
  only works this cleanly here because 16 divides by 4 with nothing left over.
- **The loads and adds are interleaved.** For example, `t8` is loaded before
  `t6` is added. This is only scheduling, to hide memory latency. To untangle
  it, match each `addu` to the register that a `lw` filled.

Your C is still a four-line `for` loop. You never write the unrolling yourself.
You learn to *recognize* it, so that you can look at sixteen instructions and
see one statement.

The target moves data instead of accumulating it. Count its memory operations
per trip and its counter step, and read the hints, because the pointer
arithmetic has one unusual detail.

## Your task

Write `func_80191a0c` to reproduce the target assembly.

<!-- solution -->
```c
void func_80191a0c(s32 *dst, s32 *src) {
    s32 i;

    for (i = 0; i < 8; i++) {
        dst[i] = src[i];
    }
}
```
