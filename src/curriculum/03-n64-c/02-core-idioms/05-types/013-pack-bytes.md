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
  - "Three word-sized value parameters, three byte stores at consecutive offsets. The argument registers map to offsets in order."
  - "No masking anywhere — remember which conversion the store performs on its own."
---

# Three writes, no conversions

Structs are next chapter's business, but game code packs bytes into
buffers with plain pointers all the time — message headers, color
triplets, tile attributes. The shape is a run of `sb`s at stepping
offsets, and the pleasure of it is everything that *isn't* there. Here's
`set_header`, which writes a kind byte and clears the byte after it:

```c
void set_header(u8 *h, s32 kind) {
    h[0] = kind;
    h[1] = 0;
}
```

```asm
sb    a1, 0(a0)     # h[0] = kind — sb truncates for free
sb    zero, 1(a0)   # h[1] = 0 — the zero register, stored narrow
jr    ra
nop
```

Two things to relish:

- `kind` arrives as a full `s32` and hits memory as one byte — no `andi`,
  because the store converts (this chapter's refrain, one last time).
  Keeping value parameters word-sized like this is *common and
  deliberate* in real code: it also spares the function the homing
  ritual a narrow parameter would trigger.
- `sb zero` — the hardware's free constant works at every width. A run
  of `sb zero`/`sh zero` at climbing offsets is memory being cleared
  field by field, and each line is one `= 0` assignment in C.

Decoding a packing function is mechanical: each `sb` is one assignment,
offset = index, source register = which parameter (in `a1`, `a2`, `a3`
order). Write the assignments top to bottom and you're done.

The target packs its value arguments into three consecutive byte slots.
Read the offsets and match them to the argument registers.

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
