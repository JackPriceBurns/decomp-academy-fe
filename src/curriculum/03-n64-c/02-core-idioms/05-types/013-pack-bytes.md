---
id: 8b7da019-c3b2-4782-b2b1-4151099c41d8
slug: types-pack-bytes
title: "Packing Bytes Into Memory"
difficulty: 3
concepts:
  - types
  - stores
  - arrays
symbol: func_802df680
hints:
  - "There are three word-sized value parameters and three byte stores at consecutive offsets. The argument registers map to the offsets in order."
  - "There is no masking anywhere. Remember which conversion the store does on its own."
---

# Byte writes with no conversions

Structs come in the next chapter. Even without them, game code often packs
bytes into buffers through plain pointers, for things like message headers,
color triplets and tile attributes. The pattern is a run of `sb`s at
increasing offsets, and the useful thing to notice is what the code does
*not* contain. Here is `set_header`, which writes a kind byte and clears the
byte after it:

```c
void set_header(u8 *h, s32 kind) {
    h[0] = kind;
    h[1] = 0;
}
```

```asm
sb    a1, 0(a0)     # h[0] = kind (sb truncates for free)
sb    zero, 1(a0)   # h[1] = 0 (the zero register, stored narrow)
jr    ra
nop
```

Notice two things:

- `kind` arrives as a full `s32` and is written to memory as one byte. There
  is no `andi`, because the store does the conversion, as you have seen
  throughout this chapter. Keeping value parameters word-sized like this is
  *common and deliberate* in real code. It also means the function avoids the
  homing ritual that a narrow parameter would cause.
- `sb zero` stores the zero register, a constant the hardware gives you for
  free, and it works at every width. A run of `sb zero`/`sh zero` at
  increasing offsets is memory being cleared one field at a time. Each line is
  one `= 0` assignment in C.

Decoding a packing function follows fixed steps. Each `sb` is one assignment.
The offset is the index. The source register tells you which parameter is
stored (in `a1`, `a2`, `a3` order). Write the assignments from top to bottom,
and the function is complete.

The target packs its value arguments into consecutive byte slots. Read the
offsets and match them to the argument registers.

## Your task

Write `func_802df680` to reproduce the target assembly.

<!-- solution -->
```c
void func_802df680(u8 *dst, s32 r, s32 g, s32 b) {
    dst[0] = r;
    dst[1] = g;
    dst[2] = b;
}
```
