---
id: 99dd9eea-8d32-5b56-a87b-acb77ec611bb
slug: types-explicit-cast
title: Casts That Sign-Extend
difficulty: 3
concepts:
  - casts
  - sign-extension
  - extsb
  - extsh
symbol: func_80277678
hints:
  - Casting to a signed byte and back re-spreads the sign bit.
  - "`(s8)x` compiles to a single `extsb r3, r3`."
---

# An explicit cast can be a whole instruction

Not every cast is free. Push a wide signed value *down* into a narrower signed
type and then let it widen back, and the value has to be squeezed through that
narrow range, so it gets sign-extended from the cast's width on the way out.

Here is a function that narrows an `int` into the range of a signed halfword:

```asm
extsh r3, r3        # narrow to s16 width, sign bit re-spread
blr
```

What **`extsh`** (*extend sign halfword*) does is hold onto the low 16 bits and
copy bit 15 up across the top 16, so the register ends up holding a properly
sign-extended 32-bit value. Drop down a width and you get **`extsb`** (*extend
sign byte*), which does the same trick from bit 7 across the top 24:

```asm
extsb r3, r3        # narrow to s8 width, sign bit re-spread
blr
```

A stray `extsb` or `extsh` on its own in the disassembly usually comes from an
explicit narrowing cast in the source rather than from a load.

## Your task

Write `func_80277678` so it compiles to the single `extsb` above.

<!-- solution -->
```c
int func_80277678(int x) {
    return (s8)x;
}
```
