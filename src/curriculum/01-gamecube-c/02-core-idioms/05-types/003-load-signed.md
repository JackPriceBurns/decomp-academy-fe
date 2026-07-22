---
id: 69e56ecd-02cf-5b4e-8e8f-9888f0d60660
slug: types-load-signed
title: Signed Loads Sign-Extend
difficulty: 2
concepts:
  - loads
  - signed
  - sign-extension
symbol: load_s16
hints:
  - A signed halfword load that widens to int is `lha`, not `lhz`.
  - "`return p[0];` on an `s16*` compiles to a single `lha r3, 0(r3)`."
---

# Filling the top bits with the sign

Read a **signed** narrow value into a 32-bit register and zeroing the top bits
won't do, since a negative `s8` such as `-1` (`0xFF`) has to widen into
`0xFFFFFFFF` rather than `0x000000FF`. Halfwords get their own instruction for
that, **`lha`** (*load halfword algebraic*), which fills the high bits with the
sign as it reads:

```asm
lha  r3, 0(r3)   # halfword, sign-extended into r3
blr
```

The byte case is the awkward exception, because there is **no** "load byte
algebraic" to match it. A signed byte that needs widening comes in on `lbz` and
then gets a separate **`extsb`** (*extend sign byte*) to clean it up, a pairing
you'll spot any time an `s8` is widened to an `int`:

```asm
lbz   r3, 0(r3)
extsb r3, r3     # sign-extend the byte to 32 bits
blr
```

## Your task

Write `load_s16` to
`int`. Because the result is used as a 32-bit `int`, the load must sign-extend.

<!-- solution -->
```c
int load_s16(s16* p) {
    return p[0];
}
```
