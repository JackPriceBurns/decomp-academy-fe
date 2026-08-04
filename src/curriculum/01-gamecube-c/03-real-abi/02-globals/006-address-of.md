---
id: 9fd79c37-3858-53a7-baa3-3c65635ba76d
slug: globals-address-of
title: "Taking an Address: SDA li vs. the @ha/@l Pair"
difficulty: 3
concepts:
  - globals
  - address-of
  - sda21
  - addr16
  - lis
  - ha-lo
symbol: func_803f5e70
hints:
  - An array's address isn't in the SDA window, so it's built from two halves.
  - "`return gPalette;` compiles to `lis r3, gPalette@ha` then `addi r3, r3,
    gPalette@l` — relocations R_PPC_ADDR16_HA / R_PPC_ADDR16_LO."
---

# Two ways to materialize an address

Returning a global's address instead of its value plays out two ways, depending on
where the global lives.

A small-data scalar already sits one `r13`/`r2` offset from its base, so MWCC folds
that offset into a register with the SDA21 relocation. The linker later turns that
into `addi r3, r13, g`. Before linking, neither offset nor base is filled in, so
the disassembler prints `addi r3, r3, 0` (or `li r3, 0`) with the reloc attached.
The `g@sda21(r13)` operand isn't in the raw object; it appears only after linking:

```asm
addi  r3, r13, g@sda21   # r3 = &g  (small-data scalar; "li r3, 0" + reloc unlinked)
blr
```
```
R_PPC_EMB_SDA21   g
```

A non-small-data symbol is the other case. Anything outside the SDA window —
arrays, typically — has no short offset, so its full 32-bit address is assembled
from two halves using the high-adjusted / low pair:

```asm
lis   r3, tbl@ha        # r3 = high 16 bits (adjusted for sign of low half)
addi  r3, r3, tbl@l     # add low 16 bits → full &tbl
blr
```
```
R_PPC_ADDR16_HA   tbl
R_PPC_ADDR16_LO   tbl
```

`@ha` is "high adjusted": the top 16 bits bumped by one when the low half is
negative. `@l` is the low half. A `lis ...@ha` paired with `addi ...@l`, backed by
`R_PPC_ADDR16_HA` and `R_PPC_ADDR16_LO`, is the unmistakable mark of a non-SDA
address. Arrays are the classic thing that ends up here, which is what you'll
reproduce below.

## Your task

`extern int gPalette[];` is provided. Write `func_803f5e70` to reproduce the
`lis @ha` / `addi @l` pair above — the two-instruction sequence that materializes
a non-SDA address.

<!-- solution -->
```c
int* func_803f5e70(void) {
    return gPalette;
}
```

<!-- context -->
```c
extern int gPalette[];
```
