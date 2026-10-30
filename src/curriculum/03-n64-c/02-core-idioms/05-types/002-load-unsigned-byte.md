---
id: d8c67045-aa85-4f70-947b-17492e0a279e
slug: types-load-unsigned-byte
title: "lbu: Loading an Unsigned Byte"
difficulty: 2
concepts:
  - types
  - loads
  - zero-extension
symbol: func_802319c0
hints:
  - "There are two loads with different mnemonics, from two different pointers. Each mnemonic decides the declaration of its parameter."
  - "The sum is computed from scratch registers straight into `v0`. It is one line of C."
---

# Filling the top with zeros

An unsigned byte fills the other 24 bits with zeros. The instruction for this
is `lbu`, load byte **unsigned**, and here the `u` really does mean unsigned.
Here is `fetch`, which returns the third byte of a `u8` array:

```c
s32 fetch(u8 *src) {
    return src[2];
}
```

```asm
lbu   v0, 2(a0)     # v0 = src[2], zero-extended: top 24 bits are 0
jr    ra
nop
```

The same byte `0xFB` in memory now arrives as `0x000000FB`, which is 251. With
`lb` it was -5. The bits in memory are the same, but the register ends up
holding two different 32-bit numbers. The *declaration* decides which one, and
the mnemonic shows you that decision:

- `lb`: the top bits are copies of bit 7. The value range is -128…127. The C
  type is `s8`.
- `lbu`: the top bits are zero. The value range is 0…255. The C type is `u8`.

When you read a target, use the oracle in reverse. Every `lbu` means a `u8`
somewhere in your declarations, and every `lb` means an `s8`. If you get one
wrong, the diff disagrees on exactly that mnemonic, and the register use around
it still matches perfectly. That pattern tells you the bug is in the *type*,
and the expression is correct.

The target reads one byte through each of its pointers and combines them. It
is a one-line function, but it only matches if each parameter is declared the
way its load mnemonic requires.

## Your task

Write `func_802319c0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802319c0(s8 *a, u8 *b) {
    return *a + *b;
}
```
