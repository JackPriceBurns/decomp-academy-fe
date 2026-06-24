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
char u8;` — and shows up everywhere in GameCube code. The matching signed and
wider types are `s8`, `u16`/`s16`, `u32`/`s32`.)

In the previous lesson, a variable index required a `slwi` to scale it by the
element size before the indexed load. The shift amount equals `log2(sizeof(T))`.
For `u8`, `sizeof(u8)` is 1 — shifting by 0 is a no-op. So no shift appears at
all; the index register goes straight into the indexed load.

Here is a function that writes through a `u8` pointer with a variable index:

```c
void set_byte(u8* p, int i, u8 v) {
    p[i] = v;
}
```

```asm
stbx  r5, r3, r4  # store byte v at p + i
blr
```

No `slwi` before the `stbx` — because `i * 1 = i`. The store variant `stbx`
and the load variant `lbzx` both work the same way: two registers, no shift.

`lbzx` zero-extends the byte into the full destination register, which is what
an unsigned `u8` produces. A diagnostic rule when reading disassembly:
`lbzx` alone, with no following `extsb`, is strong evidence the original type
was unsigned. An `lbzx` followed by `extsb` points to a signed `char`/`s8`
being widened — the `extsb` shows up only when a signed byte is promoted to a
wider type.

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
