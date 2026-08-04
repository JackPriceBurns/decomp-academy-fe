---
id: fd592871-2c35-51e6-8916-d96229deb3d5
slug: bitwise-and-mask
title: Masking Bits With AND
difficulty: 1
concepts:
  - bitwise
  - and
  - masks
symbol: func_803564a0
hints:
  - AND against a small constant mask uses the immediate form.
  - "`x & 0x12` compiles to `andi. r3, r3, 18` (0x12 == 18)."
  - The dot on `andi.` is just a flag side effect; ignore it.
---

# Keeping only the bits you want

Masking throws away the bits you don't care about. AND a number with a mask and
only the mask's set bits survive, while everything else collapses to zero. When
those set bits lie scattered rather than forming a single run, MWCC falls back to
its immediate AND, `andi.`.

Watch `n` get masked with `0x0A`, decimal 10, with bits 1 and 3 set:

```asm
andi.  r3, r3, 10
blr
```

Only 16 bits fit in that immediate, which pins `andi.` to the low half-word and
nothing above it. The dot riding on the mnemonic is a separate matter: it writes
`cr0` as a side effect. MWCC keeps emitting `andi.` even where the flags go
unread, because PowerPC has no dotless immediate AND.

(A run of contiguous bits compiles another way, which "Testing Whether a Bit Is
Set" covers. Because `0x0A` splits its set bits apart, `andi.` is what you land
on.)

The target is below. Recover the mask from its immediate, then write the C
expression that reproduces it.

```asm
andi.  r3, r3, 18
blr
```

## Your task

Write `func_803564a0` to match the target.

<!-- solution -->
```c
u32 func_803564a0(u32 x) {
    return x & 0x12;
}
```
