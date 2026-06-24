---
id: globals-address-of
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

Returning the *address* of a global (rather than its value) splits into two cases.

**A small-data scalar** has its address sitting one `r13`/`r2` offset away, so MWCC
just adds that offset into a register — encoded with the SDA21 relocation. At link
time it becomes a real `addi r3, r13, g`. Unlinked, the offset and base register
aren't filled in yet, so the disassembler prints the bare `addi r3, r3, 0`
(equivalently shown as `li r3, 0`) with the reloc attached — there's no
`g@sda21(r13)` text in the raw object; that operand only exists once the linker
resolves it:

```asm
addi  r3, r13, g@sda21   # r3 = &g  (small-data scalar# "li r3, 0" + reloc unlinked)
blr
```
```
R_PPC_EMB_SDA21   g
```

**A non-small-data symbol** — anything the linker places outside the SDA window,
such as an array — needs its full 32-bit address built from two halves with the
classic **high-adjusted / low** pair:

```asm
lis   r3, tbl@ha        # r3 = high 16 bits (adjusted for sign of the low half)
addi  r3, r3, tbl@l     # add the low 16 bits → full &tbl
blr
```
```
R_PPC_ADDR16_HA   tbl
R_PPC_ADDR16_LO   tbl
```

`@ha` is "high adjusted" (the top half, +1 if the low half is negative); `@l` is
the low half. That `lis ...@ha` / `addi ...@l` pair with `R_PPC_ADDR16_HA` +
`R_PPC_ADDR16_LO` is *the* signature of a non-SDA address. Arrays in particular
land here — which is exactly what this lesson exercises.

## Your task

`extern int gPalette[];` is provided. Write `getPalette`, returning the array's
address (`gPalette` decays to a pointer). Expect the `lis @ha` / `addi @l` pair.

<!-- starter -->
```c
int* getPalette(void) {
    return 0;
}
```

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
