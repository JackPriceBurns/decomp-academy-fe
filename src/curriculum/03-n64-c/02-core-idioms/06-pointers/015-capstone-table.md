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
  - "Guard, then the indexing trio, then the RMW sandwich — three idioms from this chapter in a row. The `sll` in the branch's delay slot belongs to the indexing, hoisted up."
  - "The load and store share `0(v0)` — one element updated in place, by the amount in the third argument. Two lines of C inside the `if`, or one compound assignment."
---

# Three idioms, one function

Chapter capstone. Real functions don't use one idiom at a time — they
stack a guard on an index on an update, and you read the stack from
the top down. A worked example first, with the same spirit: `tally`
reads two neighboring bytes, but only if the table exists:

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
 4:  addu  v1, a1, a0     # (slot) &v[i] — the byte-array duo, hoisted!
 8:  jr    ra
 c:  or    v0, zero, zero # (slot) the NULL result, 0
10:  lbu   t6, 1(v1)      # v[i + 1] — neighbor via offset
14:  lbu   t7, 0(v1)      # v[i]
18:  addu  v0, t6, t7
1c:  jr    ra
20:  nop
```

The instructive line is the first delay slot: the *address
computation* for `v[i]` runs before the guard has decided anything.
If `v` is NULL the `addu` still executes — computing a garbage address
is harmless as long as nothing *loads* from it, and IDO exploits that
to keep the slot busy. Work in a slot may belong to the path that
*isn't* taken; ask "who uses this register later?" rather than
assuming slot work is universal.

From there it's pure vocabulary: duo with offsets 0 and 1 = byte
neighbors, `or v0, zero, zero` in the early-out slot = `return 0`.

The target is the writing counterpart: guard a word table for NULL,
address one element by variable index, and nudge it in place by the
third argument. Guard, trio, sandwich — read each layer, then write
them in order.

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
