---
id: 8c44e2c5-31b9-4b34-bc2e-9f13da5e5281
slug: types-widening-copy
title: "Widening Copies: The Load Converts"
difficulty: 2
concepts:
  - types
  - loads
  - stores
symbol: func_80311388
hints:
  - "Read the load mnemonic for the source's type and the store mnemonic for the destination's width — they differ, and that's the whole point."
  - "Two pointer parameters, one assignment statement. No casts needed anywhere."
---

# Memory to memory, growing on the way

Copy a narrow value into a wider slot and the conversion work lands
entirely on the **load** — the store just writes whatever register it's
given. Here's `widen`, copying a signed byte into a word:

```c
void widen(s32 *dst, s8 *src) {
    *dst = *src;
}
```

```asm
lb    t6, 0(a1)     # load converts: byte → sign-extended 32 bits
sw    t6, 0(a0)     # store writes the full register
jr    ra
nop
```

Two instructions, no cast in the C, no extension idiom in the assembly —
because `lb` already delivered a register-sized value. The pair of
mnemonics tells the entire type story: **`lb` names the source `s8`,
`sw` names the destination 32 bits wide.** If the source had been `u8`,
the only change would be `lbu` — top bits zero instead of sign copies,
a difference that *matters* for values ≥ 128 landing in a wider signed
slot.

That's the discipline for any memory-to-memory line: decode the load's
type, decode the store's width, and write the one assignment that
connects them. Resist adding casts — C converts on assignment by itself,
and a redundant cast, while harmless to the match, is noise a reviewer
will strike.

The target promotes an unsigned byte into a halfword slot. Both mnemonics
are doing type work — transcribe them into your pointer declarations.

## Your task

Write `func_80311388` to reproduce the target assembly.

<!-- solution -->
```c
void func_80311388(s16 *dst, u8 *src) {
    *dst = *src;
}
```
