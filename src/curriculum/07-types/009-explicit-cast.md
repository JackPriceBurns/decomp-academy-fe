---
id: types-explicit-cast
title: Casts That Sign-Extend
difficulty: 3
concepts:
  - casts
  - sign-extension
  - extsb
  - extsh
symbol: as_s8
hints:
  - Casting to a signed byte and back re-spreads the sign bit.
  - "`(s8)x` compiles to a single `extsb r3, r3`."
---

# An explicit cast can be a whole instruction

A cast isn't always free. Casting a wide signed value *down* to a signed narrow
type and back up forces the value through that narrow range, which means
sign-extending from the cast width. `(s8)x` keeps the low byte but re-spreads its
sign bit, exactly **`extsb`**:

```asm
extsb r3, r3        # (s8) x, then widened back to int
blr
```

The halfword cast `(s16)x` is the same idea one size up — **`extsh`** (*extend
sign halfword*):

```asm
extsh r3, r3        # (s16) x
blr
```

So a lone `extsb` or `extsh` in the disassembly often comes straight from an
explicit narrowing cast in the source, not from a load.

## Your task

Write `as_s8` so it compiles to the single `extsb` above.

<!-- starter -->
```c
int as_s8(int x) {
    return 0;
}
```

<!-- solution -->
```c
int as_s8(int x) {
    return (s8)x;
}
```
