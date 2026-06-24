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

A `u16`/`s16` is two bytes, so the byte address of element `i` is `base + i*2`.
The compiler encodes that scale as `slwi` by 1 (left shift = multiply by 2).
The load instruction that follows then fetches two bytes at the computed address.

Two halfword load instructions exist for indexed (register+register) addressing:
`lhzx` (*load halfword zero-extend indexed*) and `lhax` (*load halfword algebraic
indexed*). They differ only in what they do to the upper bits: `lhzx` fills them
with zeros (unsigned), `lhax` replicates the sign bit (signed).

As a concrete example, loading from an **unsigned** `u16` array:

```c
u16 get_elem(u16* arr, int idx) {
    return arr[idx];
}
```

```asm
slwi    r0,r4,1      # idx * 2
lhzx    r3,r3,r0    # zero-extend load at arr[idx]
blr
```

The shift of 1 in `slwi` tells you the element size is 2 bytes. The `z` vs `a`
in the load mnemonic tells you unsigned vs signed. Study how the mnemonic changes
when the pointer type is `s16*` instead of `u16*`.

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
