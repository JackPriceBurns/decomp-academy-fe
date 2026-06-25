---
id: types-rmw-half
title: A Signed Halfword Read-Modify-Write
difficulty: 3
concepts:
  - loads
  - stores
  - read-modify-write
  - signed
  - sign-extension
symbol: rmw_half
hints:
  - "A *signed* halfword read-modify-write loads with `lha` (it sign-extends),
    not `lhz`."
  - The store is `sth`; like every store it just truncates to width, so the sign
    handling lives entirely in the *load*.
---

# Sign lives in the load, width lives in the store

Move the read-modify-write up to halfword width, and add signedness. The
three-phase shape is unchanged — load, modify, store — but two instructions
change with the type. Because the data is **signed** `s16`, the load must
sign-extend, so it's **`lha`** (*load halfword algebraic*), not `lhz`. The store
is **`sth`**, the halfword store, which truncates like any store.

Consider `quad(p)`, which scales the signed halfword at `p[0]` by 4. A multiply
by a power of two strength-reduces to a left shift (**`slwi`**):

```asm
lha   r0, 0(r3)   # load p[0], sign-extended (s16 is signed)
slwi  r0, r0, 2   # * 4  (shift left by 2)
sth   r0, 0(r3)   # truncate back to a halfword
blr
```

The split is worth fixing in your head: the **load** carries the signedness
(`lha` vs `lhz`), the arithmetic runs in a full 32-bit register, and the
**store** only carries the width (`sth` keeps the low 16 bits, sign be damned).
If you read this value back later through a signed pointer, *that* load
sign-extends again — the store never does.

The target uses a different arithmetic step than the worked example. Identify the
instruction between the `lha` and the `sth`, and read its operand.

## Your task

Write `rmw_half`, taking an `s16*`, to match the target assembly. The load must
be `lha` and the store `sth`.

<!-- starter -->
```c
void rmw_half(s16* p) {
}
```

<!-- solution -->
```c
void rmw_half(s16* p) {
    p[0] = p[0] + 100;
}
```
