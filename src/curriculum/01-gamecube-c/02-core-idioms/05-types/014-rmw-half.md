---
id: 8659933f-3255-522f-a3b9-ea18d22e753b
slug: types-rmw-half
title: A Signed Halfword Read-Modify-Write
difficulty: 3
concepts:
  - loads
  - stores
  - read-modify-write
  - signed
  - sign-extension
symbol: func_8019664c
hints:
  - "A *signed* halfword read-modify-write loads with `lha` (it sign-extends),
    not `lhz`."
  - The store is `sth`; like every store it just truncates to width, so the sign
    handling lives entirely in the *load*.
---

# Sign lives in the load, width lives in the store

Push the read-modify-write up to halfword width and let the value be signed.
Same three beats as before — load, modify, store — but the type drags two of
the instructions along with it. An `s16` is signed, so the load has to carry
the sign upward: that makes it `lha`, the algebraic load, rather than `lhz`. On
the way out it's `sth`, the halfword store, truncating the way every store
does.

Say `quad(p)` takes the signed halfword at `p[0]` and quadruples it. Since 4 is
a power of two, the compiler trades the multiply for a left shift, `slwi`:

```asm
lha   r0, 0(r3)   # load p[0], sign-extended (s16 is signed)
slwi  r0, r0, 2   # * 4  (shift left by 2)
sth   r0, 0(r3)   # truncate back to a halfword
blr
```

Worth remembering where each responsibility sits. Signedness rides on the load
— `lha` against `lhz`. The arithmetic plays out in a roomy 32-bit register. And
width is the store's only concern: `sth` simply keeps the bottom 16 bits and
couldn't care less about the sign. Read the same location back later through a
signed pointer and that later load sign-extends all over again; the store never
did.

Your target reaches for a different operation than the worked example does.
Find whatever sits between the `lha` and the `sth`, and read its operand
straight off.

## Your task

Write `func_8019664c` to match the target assembly. The load must be `lha` and
the store `sth`.

<!-- solution -->
```c
void func_8019664c(s16* p) {
    p[0] = p[0] + 100;
}
```
