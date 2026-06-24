---
id: pointers-u16-array
title: Halfword Arrays Shift by One
difficulty: 3
concepts:
  - loads
  - indexed-addressing
  - u16
  - sign
symbol: half_at
hints:
  - Element size 2 → scale with `slwi` by 1.
  - "A signed s16 sign-extends: `slwi r0, r4, 1` then `lhax r3, r3, r0`."
---

# Two bytes, shift by one — and sign matters

A `u16`/`s16` is two bytes, so the index is scaled by 2 (`slwi` by 1). The load
itself splits on **sign**: an unsigned `u16` zero-extends with `lhzx`, while a
signed `s16` sign-extends with `lhax` (*load halfword algebraic*, indexed).

For a signed `s16*`:

```asm
slwi r0, r4, 1    # i * 2  (sizeof(s16))
lhax r3, r3, r0   # load p[i], sign-extended
blr
```

Swap to `u16` and the only change is `lhax` → `lhzx`. The shift of 1 tells you
2-byte elements; the `a` vs `z` in the mnemonic tells you signed vs unsigned.

## Your task

Write `half_at` to match the target assembly above.

<!-- starter -->
```c
s16 half_at(s16* p, int i) {
    return 0;
}
```

<!-- solution -->
```c
s16 half_at(s16* p, int i) {
    return p[i];
}
```
