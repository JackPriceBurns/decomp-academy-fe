---
id: a544878d-2e5a-5763-b0bd-6ec16fab3a25
slug: globals-array-index
title: Indexing a Global Array
difficulty: 4
concepts:
  - globals
  - array
  - addr16
  - lwzx
  - scaled-index
symbol: func_8015121c
hints:
  - Array base via the @ha/@l pair, index scaled by the element size, then an
    indexed load.
  - "`gScores[i]` becomes `lis @ha`, `slwi r0, r3, 2`, `addi @l`, `lwzx r3, r3,
    r0`."
---

# Base address plus a scaled index

`tbl[i]` from a global array is two ideas bolted together: build the address, then
run a scaled, indexed load. Arrays don't sit in small data, so the base is still
the `@ha`/`@l` pair. Scale `i` by element size and let `lwzx` ("load word zero,
indexed") grab the element off base-plus-index:

```asm
lis   r4, tbl@ha        # high half of &tbl
slwi  r0, r3, 2         # r0 = i * 4   (sizeof(int) == 4)
addi  r3, r4, tbl@l     # r3 = &tbl  (add low half)
lwzx  r3, r3, r0        # r3 = *(&tbl + i*4) = tbl[i]
blr
```
```
R_PPC_ADDR16_HA   tbl
R_PPC_ADDR16_LO   tbl
```

`slwi r0, r3, 2` shifts left by 2 — multiply by 4, the size of `int`. Then
`lwzx rD, rA, rB` reads from `rA + rB`, base plus scaled offset, no displacement.
The two `R_PPC_ADDR16` relocations mark it as a global array, not a small-data
scalar.

One detail: the `slwi` sits between `lis` and `addi`, even though it has no part in
forming the base. That's scheduling, not meaning. It doesn't depend on the address
pair, so MWCC drops it into the gap to hide `lis` latency. Real CodeWarrior output
reorders like this constantly — don't read into it.

## Your task

`extern int gScores[];` is provided. Write `func_8015121c` so it compiles to the
indexed array load above.

<!-- solution -->
```c
int func_8015121c(int i) {
    return gScores[i];
}
```

<!-- context -->
```c
extern int gScores[];
```
