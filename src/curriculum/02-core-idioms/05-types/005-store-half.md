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
sth  r4, 0(r3)   # p[0] = (u16) v
blr
```

The store family mirrors the load family by width: `stb` for bytes, `sth` for
halfwords, `stw` for words. None of them care about sign — they all just truncate
to their width and copy. If you later read the value back signed, the *load* is
where sign-extension happens, never the store.

## Your task

Write `store_u16` so it compiles to the `sth` above.

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
