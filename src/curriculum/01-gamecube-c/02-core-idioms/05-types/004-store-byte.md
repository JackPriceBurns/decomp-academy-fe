---
id: f180b6da-1032-5760-8654-573a09983781
slug: types-store-byte
title: Storing a Byte Truncates
difficulty: 2
concepts:
  - stores
  - truncation
symbol: func_800602d8
hints:
  - Writing one byte uses `stb` (store byte).
  - "`p[0] = v;` compiles to `stb r4, 0(r3)` — only the low 8 bits are written."
---

# `stb` writes only the low 8 bits

Stores are the easy direction, with nothing like the signed-versus-unsigned split
that loads care about, only *width*. A write through a **`u8*`** picks **`stb`**
(*store byte*), and all it moves to memory is the **low 8 bits** of the source
register.

Take a function that writes into index 2 of a byte array:

```asm
stb  r4, 2(r3)   # arr[2] = val  (high bits of r4 ignored)
blr
```

With the pointer in `r3` and the value in `r4`, `stb` quietly **truncates**,
throwing away whatever was sitting in the upper 24 bits of `r4`. The nice part is
that this costs nothing extra: the compiler never masks the value beforehand, it
simply narrows the store down to a byte.

## Your task

Write `func_800602d8` to produce a single `stb`.

<!-- solution -->
```c
void func_800602d8(u8* p, u8 v) {
    p[0] = v;
}
```
