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
only the **low 8 bits** of the source register to memory:

```asm
stb  r4, 0(r3)   # p[0] = (u8) v   (high bits of r4 ignored)
blr
```

The pointer `p` is in `r3`, the value `v` is in `r4`. `stb` silently **truncates**
— whatever sits in the upper 24 bits of `r4` is discarded. That truncation is
"free": the compiler doesn't mask the value first, it just narrows the store.

## Your task

Write `store_u8` so it compiles to the `stb` above.

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
