---
id: a0cd223c-75a3-4ed9-8c88-09824dbc3fb1
slug: globals-narrow
title: Narrow Globals and the Load Alphabet
difficulty: 2
concepts:
  - globals
  - narrow-types
  - loads
symbol: func_80033488
hints:
  - "`lh` with no `u` sign-extends a halfword. Signed, 16 bits — which type is
    that?"
  - "The function returns an `s32`; only the global's own declaration is narrow."
---

# The load mnemonic *is* the type

Globals aren't all words. A byte-sized or halfword-sized global is accessed
with a narrower load, and — unlike the arithmetic you've seen, where signedness
rarely shows — **loads wear their signedness on their sleeve**. A narrow value
must be extended to fill the register, and the mnemonic says how:

- `lb` — load byte, **sign**-extend → `s8`
- `lbu` — load byte, **zero**-extend → `u8`
- `lh` — load halfword, **sign**-extend → `s16`
- `lhu` — load halfword, **zero**-extend → `u16`
- `lw` — load word; 32 bits fill the register exactly, so there's no `lwu`
  and no signedness clue — that has to come from elsewhere

Here's `readFlag`, which returns the global `u8` `gFlag`:

```asm
lui   v0, %hi(gFlag)
lbu   v0, %lo(gFlag)(v0)   # unsigned byte: lbu
jr    ra
nop
```

Same two-instruction global pair as always — only the load changed. This is a
gift for decompilation: a single mnemonic pins down both the *size* and the
*signedness* of a global you've never seen declared. When you eventually write
headers for a real project, `lbu` versus `lb` is often your only evidence for
`u8` versus `s8`.

The target reads one narrow global. Let the mnemonic dictate the declaration —
which is provided — and mind that *promotion* to a wider type is free: the
extension already happened during the load.

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
