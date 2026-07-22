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
symbol: getPalette
hints:
  - An array's address isn't in the SDA window, so it's built from two halves.
  - "`return gPalette;` compiles to `lis r3, gPalette@ha` then `addi r3, r3,
    gPalette@l` — relocations R_PPC_ADDR16_HA / R_PPC_ADDR16_LO."
---

# Two ways to materialize an address

Returning a global's *address* instead of its value plays out two different ways,
depending on where the global lives.

**A small-data scalar** already sits one `r13`/`r2` offset from its base, so MWCC
only has to fold that offset into a register, which it encodes with the SDA21
relocation. The linker later turns that into a genuine `addi r3, r13, g`. Before
linking, neither the offset nor the base register is filled in yet, so the
disassembler prints a stripped-down `addi r3, r3, 0` (also shown as `li r3, 0`)
with the reloc attached. The `g@sda21(r13)` operand isn't in the raw object at
all; it appears only after the linker resolves the symbol:

```asm
addi  r3, r13, g@sda21   # r3 = &g  (small-data scalar# "li r3, 0" + reloc unlinked)
blr
```
```
R_PPC_EMB_SDA21   g
```

**A non-small-data symbol** is the other case. Anything the linker drops outside
the SDA window, an array being the usual example, has no short offset to lean on,
so its full 32-bit address gets assembled from two halves using the classic
**high-adjusted / low** pair:

```asm
lis   r3, tbl@ha        # r3 = high 16 bits (adjusted for sign of the low half)
addi  r3, r3, tbl@l     # add the low 16 bits → full &tbl
blr
```
```
R_PPC_ADDR16_HA   tbl
R_PPC_ADDR16_LO   tbl
```

The `@ha` half is "high adjusted", the top 16 bits bumped by one whenever the low
half comes out negative, and `@l` is just the low half. A `lis ...@ha` paired
with an `addi ...@l`, backed by `R_PPC_ADDR16_HA` and `R_PPC_ADDR16_LO`, is *the*
unmistakable mark of a non-SDA address. Arrays are the classic thing that ends up
here, which is what you'll be reproducing below.

## Your task

`extern int gPalette[];` is provided. Write `getPalette` to reproduce the
`lis @ha` / `addi @l` pair above — the two-instruction sequence that materializes
a non-SDA address.

<!-- solution -->
```c
int* getPalette(void) {
    return gPalette;
}
```

<!-- context -->
```c
extern int gPalette[];
```
