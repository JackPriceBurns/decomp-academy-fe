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
  - "Read the load mnemonic for the source's type and the store mnemonic for the destination's width. They are different, and that difference is the point of this lesson."
  - "There are two pointer parameters and one assignment statement. No casts are needed anywhere."
---

# Memory to memory, getting wider

When you copy a narrow value into a wider slot, all of the conversion happens
in the **load**. The store writes whatever register it is given. Here is
`widen`, which copies a signed byte into a word:

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

That is two instructions, with no cast in the C and no extension idiom in the
assembly, because `lb` already put a full-width value in the register. The two
mnemonics give you all the type information: **`lb` says the source is `s8`,
and `sw` says the destination is 32 bits wide.** If the source had been `u8`,
the only change would be `lbu`. The top bits would then be zeros instead of
copies of the sign bit. That difference *matters* for values ≥ 128 copied into
a wider signed slot.

Use the same steps for any copy from memory to memory: read the load's type,
read the store's width, and write the one assignment that connects them. Don't
add casts. C converts on assignment by itself. A redundant cast does not affect
the match, but it is noise that a reviewer will remove.

The target copies a value between two different widths. Both mnemonics carry
type information, so turn each one into a pointer declaration.

## Your task

Write `func_80311388` to reproduce the target assembly.

<!-- solution -->
```c
void func_80311388(s16 *dst, u8 *src) {
    *dst = *src;
}
```
