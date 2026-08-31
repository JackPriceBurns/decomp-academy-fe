---
id: d8c67045-aa85-4f70-947b-17492e0a279e
slug: types-load-unsigned-byte
title: "lbu: The Zero-Extended Twin"
difficulty: 2
concepts:
  - types
  - loads
  - zero-extension
symbol: func_802319c0
hints:
  - "Two loads with different mnemonics from two different pointers — each mnemonic dictates that parameter's declaration."
  - "The sum happens in scratch registers, straight into `v0`. One line of C."
---

# What fills the top: nothing

The unsigned byte answers the 24-bit question differently: fill with
zeros. That's `lbu` — load byte **unsigned** — and this time the `u` means
exactly what it says. Here's `fetch`, returning the third byte of a `u8`
array:

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

The same memory byte `0xFB` now arrives as `0x000000FB` — 251, not -5.
Same bits in memory, two different 32-bit numbers in a register; the
*declaration* decides which, and the mnemonic broadcasts the decision:

- `lb` — the top bits mirror bit 7. Value range -128…127. C type `s8`.
- `lbu` — the top bits are zero. Value range 0…255. C type `u8`.

When you're staring at a target, run the oracle backwards: every `lbu`
forces a `u8` somewhere in your declarations, every `lb` an `s8`. Get one
wrong and the diff disagrees on exactly that mnemonic — the register
choreography around it will match perfectly, which is precisely how you'll
know the *type* is the bug, not the expression.

The target reads one byte through each of its pointers and combines
them — a one-line function, but only if each parameter is declared the
way its load mnemonic demands.

## Your task

Write `func_802319c0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802319c0(s8 *a, u8 *b) {
    return *a + *b;
}
```
