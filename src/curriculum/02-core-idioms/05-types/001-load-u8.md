---
id: types-load-u8
title: Loading a Byte
difficulty: 1
concepts:
  - loads
  - unsigned
  - zero-extension
symbol: load_u8
hints:
  - An unsigned byte load is `lbz` — load byte and zero.
  - "`p[0]` on a `u8*` compiles to a single `lbz r3, 0(r3)`."
---

# Width is encoded in the load

A register is 32 bits wide, but memory comes in bytes, halfwords, and words. The
*type* you read through decides which load instruction MWCC emits. Reading a
**`u8`** uses **`lbz`** — *load byte and zero* — which fetches one byte and clears
the upper 24 bits:

```asm
lbz  r3, 0(r3)   # one byte, zero-extended into r3
blr
```

The "z" in `lbz` is the whole story: an unsigned byte is **zero-extended**, so no
extra instruction is needed to clean up the register. The pointer arrives in
`r3`; the loaded value lands right back in `r3` ready to return.

One flag to plant early: the GameCube is **big-endian**. Multi-byte values are
stored most-significant byte first, so the byte at offset 0 of a word is its
*high* byte — the opposite of x86. It doesn't matter for a lone `u8`, but it will
the moment you read fields out of a struct, so keep it in mind.

## Your task

Write `load_u8` to match the target assembly above.

<!-- starter -->
```c
u8 load_u8(u8* p) {
    return 0;
}
```

<!-- solution -->
```c
u8 load_u8(u8* p) {
    return p[0];
}
```
