---
id: types-load-signed
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

# When the high bits must be filled with the sign

Reading a **signed** narrow value into a 32-bit register can't just zero the top
bits — a negative `s8` like `-1` (`0xFF`) must become `0xFFFFFFFF`. PowerPC has
a dedicated **`lha`** (*load halfword algebraic*) that sign-extends a halfword as
it loads:

```asm
lha  r3, 0(r3)   # r3 = (s32) p[0], sign-extended
blr
```

Bytes are the odd one out: there is **no** "load byte algebraic". A signed byte
that needs widening loads with `lbz` and is then fixed up with a separate
**`extsb`** (*extend sign byte*). You'll see that pair when an `s8` is widened to
an `int`:

```asm
lbz   r3, 0(r3)
extsb r3, r3     # sign-extend the byte to 32 bits
blr
```

## Your task

Write `load_s16`, taking an `s16*` and returning `p[0]` widened to `int`. Because
the result is used as a 32-bit `int`, the load must sign-extend.

<!-- starter -->
```c
int load_s16(s16* p) {
    return 0;
}
```

<!-- solution -->
```c
int load_s16(s16* p) {
    return p[0];
}
```
