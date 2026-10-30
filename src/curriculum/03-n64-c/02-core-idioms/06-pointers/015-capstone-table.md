---
id: 3fd8d470-831a-4303-ad25-7f3be48bf650
slug: pointers-capstone-table
title: "Capstone: The Guarded Update"
difficulty: 4
concepts:
  - pointers
  - null
  - rmw
  - capstone
symbol: func_803f6350
hints:
  - "The guard comes first, then the indexing trio, then the RMW sandwich: three idioms from this chapter in a row. The `sll` in the delay slot of the branch belongs to the indexing and was moved up."
  - "The load and the store share `0(v0)`, so one element is updated in place by the amount in the third argument. Inside the `if`, write two lines of C or one compound assignment."
---

# Three idioms, one function

This is the capstone for the chapter. Real functions often use several
idioms at once. A guard, an index and an update can sit one on top of the
other, and you read them from the top down. First, here is a worked example
of the same kind. `tally` reads two neighboring bytes, but only if the table
exists:

```c
s32 tally(u8 *v, s32 i) {
    if (v == NULL) {
        return 0;
    }
    return v[i] + v[i + 1];
}
```

```asm
 0:  bnez  a0, 0x10       # table present? skip the bail-out
 4:  addu  v1, a1, a0     # (slot) &v[i]: the byte-array duo, moved up
 8:  jr    ra
 c:  or    v0, zero, zero # (slot) the NULL result, 0
10:  lbu   t6, 1(v1)      # v[i + 1]: the neighbor, via the offset
14:  lbu   t7, 0(v1)      # v[i]
18:  addu  v0, t6, t7
1c:  jr    ra
20:  nop
```

The line to study is the first delay slot. The *address computation* for
`v[i]` runs before the guard has decided anything. If `v` is NULL, the `addu`
still runs. Computing a garbage address does no harm as long as nothing
*loads* from it, and IDO uses that fact to fill the slot with useful work.
Work in a delay slot may belong to the path that *isn't* taken. So ask "who
uses this register later?" instead of assuming that the slot's work is used
on every path.

The rest uses idioms you already know. A duo with offsets 0 and 1 means
neighboring bytes, and `or v0, zero, zero` in the delay slot of the early exit
means `return 0`.

The target is the writing version. It checks a word table for NULL, finds one
element by a variable index, and updates that element in place by an amount
passed in as an argument. Read each layer (guard, trio, sandwich), then write
them in the same order.

## Your task

Write `func_803f6350` to reproduce the target assembly.

<!-- solution -->
```c
void func_803f6350(s32 *tbl, s32 i, s32 d) {
    if (tbl != NULL) {
        tbl[i] += d;
    }
}
```
