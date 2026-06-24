---
id: bitwise-and-mask
title: Masking Bits With AND
difficulty: 1
concepts:
  - bitwise
  - and
  - masks
symbol: mask_bits
hints:
  - AND against a small constant mask uses the immediate form.
  - "`x & 0x12` compiles to `andi. r3, r3, 18` (0x12 == 18)."
  - The dot on `andi.` is just a flag side effect; ignore it.
---

# Keeping only the bits you want

A bitwise **AND** against a constant *mask* keeps the bits that are set in the
mask and clears the rest. When the mask has scattered (non-contiguous) bits,
MWCC reaches for the immediate-AND instruction **`andi.`**:

```asm
andi.  r3, r3, 18    # r3 = x & 0x12
blr
```

Two things to notice. First, `andi.` takes a 16-bit immediate, so it can only
mask the low half-word directly. Second, the trailing **dot** means it also
updates condition register `cr0` as a side effect — MWCC uses `andi.` even when
nobody reads the flags, simply because it's the only immediate AND PowerPC has.

(Watch out: a *contiguous* mask like `0xF0` takes a different path — covered in
"Testing Whether a Bit Is Set". For now we use `0x12`, whose bits don't form a
run.)

## Your task

Write `mask_bits` to match the target.

<!-- starter -->
```c
u32 mask_bits(u32 x) {
    return 0;
}
```

<!-- solution -->
```c
u32 mask_bits(u32 x) {
    return x & 0x12;
}
```
