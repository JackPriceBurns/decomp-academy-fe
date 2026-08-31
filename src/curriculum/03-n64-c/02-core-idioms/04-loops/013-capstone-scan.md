---
id: b1e3513f-69d4-4fbd-b040-be19d677402f
slug: loops-capstone-scan
title: "Capstone: The Big Scan"
difficulty: 5
concepts:
  - loops
  - unrolling
  - control-flow
  - capstone
symbol: func_80078d44
hints:
  - "The tracked value initializes from `arr[0]` (the very first `lw`), the counter from 1, and the guard's `slti` constant is 2 — the loop needs at least two elements to bother."
  - "Per element it's compare-and-conditionally-replace, `slt` then a skip. Six lines of C; every other line of the listing is the unroll."
---

# Forty lines, six of C

Last stop. A conditional inside a counted loop over an array — the shape of
half the scan functions in any game — hits *everything* this chapter
taught, at once, unrolled. Here's `count_matches(arr, n, key)`, which
counts how many elements equal `key`. Full listing, because reading whole
listings is now your job:

```asm
 0:  or    v1, zero, zero  # count = 0
 4:  blez  a1, 0x9c        # guard
 8:  or    v0, zero, zero  # (slot) i = 0
 c:  andi  t1, a1, 0x3     # the unroll's opening move
10:  beqz  t1, 0x40        # no remainder? main loop
14:  or    t0, t1, zero
18:  sll   t6, zero, 2     # the useless sll — hello, old friend
1c:  addu  a3, a0, t6
20:  lw    t7, 0(a3)       # ── remainder loop: the body in slow motion
24:  addiu v0, v0, 1
28:  bne   a2, t7, 0x34    # not a match? skip the increment
2c:  nop
30:  addiu v1, v1, 1       # count++
34:  bne   t0, v0, 0x20
38:  addiu a3, a3, 4
3c:  beq   v0, a1, 0x9c
40:  sll   t8, v0, 2       # ── main-loop setup
44:  sll   t9, a1, 2
48:  addu  t0, t9, a0      # end pointer
4c:  addu  a3, a0, t8
50:  lw    t2, 0(a3)       # ── main loop: element i+0
54:  bnel  a2, t2, 0x64    # no match? on to the next…
58:  lw    t3, 4(a3)       # (likely slot) …pre-loading i+1
5c:  addiu v1, v1, 1       # match: count++
60:  lw    t3, 4(a3)       # (clone) i+1 for the matched path
64:  bnel  a2, t3, 0x74    # …and the same dance three more times
68:  lw    t4, 8(a3)
6c:  addiu v1, v1, 1
70:  lw    t4, 8(a3)
74:  bnel  a2, t4, 0x84
78:  lw    t5, 12(a3)
7c:  addiu v1, v1, 1
80:  lw    t5, 12(a3)
84:  addiu a3, a3, 16
88:  bne   a2, t5, 0x94    # fourth compare, plain branch this time
8c:  nop
90:  addiu v1, v1, 1
94:  bnel  a3, t0, 0x54    # back-edge, likely, reloading element i+0
98:  lw    t2, 0(a3)
9c:  or    v0, v1, zero
a0:  jr    ra
a4:  nop
```

The reading strategy, one last time at full scale:

1. **Skeleton first.** Guard, `andi 0x3`, dead `sll`, remainder loop, main
   loop, end pointer. Skip past all of it — it's the compiler's, not yours.
2. **Read the remainder loop as the truth.** Lines `20`–`38` are the body,
   honest and unshuffled: load, compare with a skip, maybe increment.
   That's `if (arr[i] == key) count++;` and nothing else.
3. **Confirm ×4 in the main loop.** The same compare-skip-increment,
   four times, stitched together with pre-loading `bnel` slots.

The target replaces "count the matches" with "track the best": its value
isn't a counter but a running element, seeded *from the array itself*
before the loop, replaced whenever a compare says a newer element beats
it. The seeding changes the guard, too — read the `slti` constant and
think about why a loop seeded from `arr[0]` starts scanning at 1. Reverse
it with the same three steps: skeleton, remainder-loop truth, ×4 confirm.

## Your task

Write `func_80078d44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80078d44(s32 *arr, s32 n) {
    s32 best = arr[0];
    s32 i;
    for (i = 1; i < n; i++) {
        if (arr[i] > best) {
            best = arr[i];
        }
    }
    return best;
}
```
