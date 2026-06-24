---
id: types-store-byte
title: Storing a Byte Truncates
difficulty: 2
concepts:
  - stores
  - truncation
symbol: store_u8
hints:
  - Writing one byte uses `stb` (store byte).
  - "`p[0] = v;` compiles to `stb r4, 0(r3)` — only the low 8 bits are written."
---

# `stb` writes only the low 8 bits

Storing is simpler than loading: there is no signed/unsigned distinction, only
*width*. Writing through a **`u8*`** uses **`stb`** (*store byte*), which copies
only the **low 8 bits** of the source register to memory.

Consider a function that writes to index 2 of a byte array:

```asm
stb  r4, 2(r3)   # arr[2] = val  (high bits of r4 ignored)
blr
```

The pointer is in `r3`, the byte value is in `r4`. `stb` silently **truncates**
— whatever sits in the upper 24 bits of `r4` is discarded. That truncation is
"free": the compiler doesn't mask the value first, it just narrows the store.

## Your task

Write `store_u8`, taking a `u8*` and a `u8`, to produce a single `stb`.

<!-- starter -->
```c
void store_u8(u8* p, u8 v) {
}
```

<!-- solution -->
```c
void store_u8(u8* p, u8 v) {
    p[0] = v;
}
```
