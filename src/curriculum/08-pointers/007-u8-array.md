---
id: pointers-u8-array
title: Byte Arrays Need No Shift
difficulty: 3
concepts:
  - loads
  - indexed-addressing
  - u8
symbol: byte_at
hints:
  - Element size 1 means no scaling shift at all.
  - "`p[i]` on a u8* is a single `lbzx r3, r3, r4`."
---

# Scale of one

(`u8` is the GameCube SDK's typedef for `unsigned char` — `typedef unsigned
char u8;` — and shows up everywhere in this codebase. The matching signed and
wider types are `s8`, `u16`/`s16`, `u32`/`s32`.)

The scaling factor *is* the element size. A `u8` is one byte, so scaling `i` by
1 is a no-op — there's no shift at all. The index register goes straight into
the indexed byte load `lbzx rD, rA, rB` (*load byte and zero*, indexed):

```asm
lbzx r3, r3, r4   # r3 = p[i], zero-extended
blr
```

`lbzx` zero-extends the byte into the full register, which is exactly what an
unsigned `u8` wants. When you only load and store a byte, `u8` is the natural
choice; using `char` would bring in a sign-extending `extsb` the compiler
wouldn't otherwise need. That gives you a diagnostic rule when reading
disassembly: `lbzx` (or `lbz`) *alone* with no following `extsb` is strong
evidence the original type was unsigned. An `lbzx` followed by `extsb` points to
a signed `char`/`s8` *being widened* — the `extsb` shows up only when a signed
byte is promoted to a wider type, so a signed byte kept narrow still loads with a
bare `lbzx`.

## Your task

Write `byte_at` so it compiles to the `lbzx` above.

<!-- starter -->
```c
u8 byte_at(u8* p, int i) {
    return 0;
}
```

<!-- solution -->
```c
u8 byte_at(u8* p, int i) {
    return p[i];
}
```
