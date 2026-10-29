---
id: 4bb740e4-ae99-5359-9cc4-7e6addc402a0
slug: loops-inversions
title: "Capstone: Reading Nested Array Loops"
difficulty: 4
concepts:
  - nested-loops
  - triangular
  - arrays
  - conditional-update
  - capstone
symbol: func_802edd00
hints:
  - Two indexed loads per inner pass — one for the outer element, one for the inner
    — feed a single compare.
  - The inner loop starts at `i + 1`, not 0 (`addi r7, r6, 1`), so each pair is
    visited once; this is the triangular shape from the previous lesson with a
    shifted start.
  - The accumulator only advances on the `ble-` *not-taken* path — that conditional
    `addi` is the `if` body.
---

# Reading a nested loop in layers

Nested loops combine several familiar patterns. Separate loop control,
address calculations, and conditional updates before trying to reconstruct
the whole function.

Consider `gmax(a, rows, cols)`, which finds the largest element of a row-major
grid. Its inner loop visits every column of each row:

```asm
 0: lwz     r10,0(r3)
 4: li      r9,0
 8: li      r0,0
 c: b       48 <gmax+0x48>
10: mr      r7,r0
14: slwi    r6,r0,2
18: mtctr   r5
1c: cmpwi   r5,0
20: ble-    40 <gmax+0x40>
24: lwzx    r8,r3,r6
28: cmpw    r8,r10
2c: ble-    34 <gmax+0x34>
30: mr      r10,r8
34: addi    r7,r7,1
38: addi    r6,r6,4
3c: bdnz+   24 <gmax+0x24>
40: add     r0,r0,r5
44: addi    r9,r9,1
48: cmpw    r9,r4
4c: blt+    10 <gmax+0x10>
50: mr      r3,r10
54: blr
```

Start with the backward branches. The `bdnz+` at `0x3c` repeats the inner
loop using CTR, loaded from the column count by `mtctr`. The `blt+` at `0x4c`
repeats the outer loop after comparing its index with the row count.

Then trace the address calculation. MWCC advances `r6` by four bytes per inner
pass and adds the column count to `r0` between rows. It has replaced repeated
row-index multiplication with running offsets. The `lwzx` uses that byte
offset to load a candidate, and `cmpw` followed by `ble-` decides whether the
`mr r10,r8` updates the running maximum.

Use the same reading process on the target: find each loop's entry, backward
branch, and exit test. Trace where its control register is initialized and
updated, including any dependence on the enclosing loop. Finally, separate
the loads from the conditional updates and follow which branch reaches each
update. Those details tell you how to reconstruct the loops and their body.

## Your task

Write `func_802edd00` to reproduce the target assembly.

<!-- solution -->
```c
int func_802edd00(int *a, int n) {
    int i, j, c = 0;
    for (i = 0; i < n; i++) {
        for (j = i + 1; j < n; j++) {
            if (a[i] > a[j]) c++;
        }
    }
    return c;
}
```
