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
sign-extending from the cast width.

For example, a function that narrows an `int` to a signed halfword range:

```asm
extsh r3, r3        # narrow to s16 width, sign bit re-spread
blr
```

**`extsh`** (*extend sign halfword*) keeps the low 16 bits but replicates bit 15
into the top 16 — the register result is a sign-extended 32-bit value. The
byte-width equivalent is **`extsb`** (*extend sign byte*), which replicates bit 7
into the top 24 bits:

```asm
extsb r3, r3        # narrow to s8 width, sign bit re-spread
blr
```

A lone `extsb` or `extsh` in the disassembly often comes straight from an
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
