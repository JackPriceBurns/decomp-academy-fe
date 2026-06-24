---
id: types-store-half
title: Storing a Halfword
difficulty: 2
concepts:
  - stores
  - truncation
symbol: store_u16
hints:
  - Writing one halfword uses `sth` (store halfword).
  - "`p[0] = v;` compiles to `sth r4, 0(r3)`."
---

# `sth` is the 16-bit store

The halfword store is **`sth`** (*store halfword*), writing the **low 16 bits**
of a register:

```asm
sth  r4, 6(r3)   # table[3] = val
blr
```

Here a function writes to index 3 of a `u16` array (offset 6 bytes). The pointer
is in `r3`, the value in `r4`.

The store family mirrors the load family by width: `stb` for bytes, `sth` for
halfwords, `stw` for words. None of them care about sign — they all just truncate
to their width and copy. If you later read the value back signed, the *load* is
where sign-extension happens, never the store.

## Your task

Write `store_u16`, taking a `u16*` and a `u16`, to produce a single `sth`.

<!-- starter -->
```c
void store_u16(u16* p, u16 v) {
}
```

<!-- solution -->
```c
void store_u16(u16* p, u16 v) {
    p[0] = v;
}
```
