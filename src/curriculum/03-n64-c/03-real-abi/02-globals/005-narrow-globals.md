---
id: a0cd223c-75a3-4ed9-8c88-09824dbc3fb1
slug: globals-narrow
title: Narrow Globals and the Load Mnemonics
difficulty: 2
concepts:
  - globals
  - narrow-types
  - loads
symbol: func_80033488
hints:
  - "`lh` with no `u` sign-extends a halfword. Which type is signed and 16 bits wide?"
  - "The function returns an `s32`. Only the global's own declaration is narrow."
---

# The load mnemonic tells you the type

Not every global is a full word. A global the size of a byte or a halfword is
read with a narrower load. In the arithmetic you have seen so far, signedness
rarely shows. **Loads always show their signedness.** A narrow value must be
extended to fill the register, and the mnemonic says how:

- `lb`: load byte, **sign**-extend → `s8`
- `lbu`: load byte, **zero**-extend → `u8`
- `lh`: load halfword, **sign**-extend → `s16`
- `lhu`: load halfword, **zero**-extend → `u16`
- `lw`: load word. The 32 bits fill the register exactly, so there is no `lwu`
  and no clue about signedness. That has to come from somewhere else.

Here is `readFlag`, which returns the global `u8` `gFlag`:

```asm
lui   v0, %hi(gFlag)
lbu   v0, %lo(gFlag)(v0)   # unsigned byte: lbu
jr    ra
nop
```

This is the same two-instruction global pair as always. Only the load is
different. This helps a lot in decompilation: one mnemonic tells you both the
*size* and the *signedness* of a global you have never seen declared. When you
later write headers for a real project, `lbu` versus `lb` is often your only
evidence for `u8` versus `s8`.

The target reads one narrow global. Its declaration follows from the mnemonic,
and it is provided for you. Note that *promotion* to a wider type costs nothing
extra, because the extension already happened during the load.

## Your task

`extern s16 gDepth;` is declared for you. Write `func_80033488` to reproduce the
target assembly.

<!-- solution -->
```c
s32 func_80033488(void) {
    return gDepth;
}
```

<!-- context -->
```c
extern s16 gDepth;
```
