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
  - "The tracked value starts as `arr[0]` (the very first `lw`), and the counter starts at 1. The guard's `slti` constant is 2, because the loop only needs to run when there are at least two elements."
  - "For each element, the body compares and then maybe replaces: an `slt`, then a skip. That is six lines of C. Every other line of the listing comes from the unroll."
---

# Forty lines, six of C

This is the last lesson in the chapter. A conditional inside a counted loop
over an array is the shape of half the scan functions in any game. Once it is
unrolled, it uses *everything* this chapter taught, all at once. Here is
`count_matches(arr, n, key)`, which counts how many elements equal `key`. The
full listing is shown, because reading whole listings is now your job:

```asm
 0:  or    v1, zero, zero  # count = 0
 4:  blez  a1, 0x9c        # guard
 8:  or    v0, zero, zero  # (slot) i = 0
 c:  andi  t1, a1, 0x3     # the unroll's opening move
10:  beqz  t1, 0x40        # no remainder? main loop
14:  or    t0, t1, zero
18:  sll   t6, zero, 2     # the useless sll again
1c:  addu  a3, a0, t6
20:  lw    t7, 0(a3)       # ── remainder loop: the body, one element at a time
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
64:  bnel  a2, t3, 0x74    # …and the same steps three more times
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

Here is the reading method one last time, at full scale:

1. **Structure first.** Find the guard, the `andi 0x3`, the dead `sll`, the
   remainder loop, the main loop and the end pointer. Then skip past all of
   it. The compiler made that code, and you don't write it.
2. **Trust the remainder loop.** Lines `20` to `38` are the body, plain and
   in order: load, compare with a skip, and maybe increment. That is
   `if (arr[i] == key) count++;` and nothing else.
3. **Confirm the ×4 in the main loop.** It has the same compare, skip and
   increment four times, joined by `bnel` slots that load the next element
   early.

The target tracks the best element instead of counting matches. The value
it keeps is an element of the array. That value is set *from the array
itself* before the loop, and it is replaced whenever a compare finds a newer
element that beats it. Setting it from the array also changes the guard.
Read the `slti` constant, and think about why a loop that starts from
`arr[0]` begins scanning at 1. Decompile it with the same three steps:
structure first, trust the remainder loop, and confirm the ×4.

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
