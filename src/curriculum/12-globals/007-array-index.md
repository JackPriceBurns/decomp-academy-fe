---
id: globals-array-index
title: Indexing a Global Array
difficulty: 4
concepts:
  - globals
  - array
  - addr16
  - lwzx
  - scaled-index
symbol: getScore
hints:
  - Array base via the @ha/@l pair, index scaled by the element size, then an
    indexed load.
  - "`gScores[i]` becomes `lis @ha`, `slwi r0, r3, 2`, `addi @l`, `lwzx r3, r3,
    r0`."
---

# Base address plus a scaled index

Reading `tbl[i]` from a global array combines the address-building you just saw
with a **scaled, indexed load**. The base comes from the `@ha`/`@l` pair (arrays
aren't small-data), the index `i` is multiplied by the element size, and a single
indexed load (`lwzx` — "load word zero, indexed") fetches the element:

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

`slwi r0, r3, 2` is "shift left word immediate by 2" = multiply by 4, the
`int` element size. `lwzx rD, rA, rB` loads from `rA + rB` — base plus the scaled
offset, no displacement needed. The two `R_PPC_ADDR16` relocations confirm it's a
global array rather than a small-data scalar.

Notice the `slwi` lands *between* the `lis` and the `addi` even though it has
nothing to do with building the base address. That's instruction scheduling, not
meaning: the index scaling is independent of the address pair, so MWCC slots it
into the gap to hide the `lis` latency. Order like this is normal in real
CodeWarrior output — don't read it as significant.

## Your task

`extern int gScores[];` is provided. Write `getScore`, taking an `int i`, so it
compiles to the indexed array load above.

<!-- starter -->
```c
int getScore(int i) {
    return 0;
}
```

<!-- solution -->
```c
int getScore(int i) {
    return gScores[i];
}
```

<!-- context -->
```c
extern int gScores[];
```
