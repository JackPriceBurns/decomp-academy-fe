---
id: 9216a35a-2b08-5846-9816-26461a416cf7
slug: pointers-u8-array
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

(`u8` is the GameCube SDK's name for `unsigned char`, spelled `typedef unsigned
char u8;` in the headers. You'll see it constantly. Its siblings are `s8` when
signed, then `u16`/`s16` and `u32`/`s32` for the wider sizes.)

Last lesson the variable index got an `slwi` to scale it, the shift amount being
`log2(sizeof(T))`. A `u8` is one byte, though. `log2(1)` is 0, a zero shift does
nothing, and the compiler just drops it. The raw index register feeds the indexed
load with no scaling in between.

Here's a write through a `u8` pointer at a variable index:

```c
void set_byte(u8* p, int i, u8 v) {
    p[i] = v;
}
```

```asm
stbx  r5, r3, r4  # store byte v at p + i
blr
```

No `slwi` ahead of the `stbx`, since `i * 1` is `i`. The store `stbx` and the
load `lbzx` behave identically here, two registers and nothing scaled.

There's a signedness tell hiding in `lbzx` too. It zero-extends the byte into the
full register, which is what an unsigned `u8` wants. A lone `lbzx` with nothing
after it usually means the source was unsigned. Spot an `extsb` glued on right
behind it and the byte was signed, a `char` or `s8` being widened. That sign
extend is the giveaway.

## Your task

Write `byte_at` so it compiles to the `lbzx` above.

<!-- solution -->
```c
u8 byte_at(u8* p, int i) {
    return p[i];
}
```
