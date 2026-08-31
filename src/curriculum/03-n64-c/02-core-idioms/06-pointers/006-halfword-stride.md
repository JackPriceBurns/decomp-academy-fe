---
id: 02a86414-9a0f-4fce-bcb4-94961a6d01b5
slug: pointers-halfword-stride
title: "Halfword Arrays: Stride 2"
difficulty: 2
concepts:
  - pointers
  - arrays
  - types
  - shifts
symbol: func_800aa190
hints:
  - "Two `sll`s by 1 doing two different jobs — the first scales the index, the second is arithmetic on the loaded value."
  - "The load is `lh`, not `lhu` — let that pick the pointer's element type. The trailing `or` into `v0` is IDO's usual copy-out, not a C statement."
---

# The sll amount is the element size

Change the element type and exactly one number changes in the indexing
trio: the shift amount. A `u16` array strides by 2, so the index is
scaled with `sll … 1`:

```c
s32 hw_at(u16 *t, s32 i) {
    return t[i];
}
```

```asm
sll   t6, a1, 1     # i * 2      (stride of a halfword)
addu  t7, a0, t6    # &t[i]
lhu   v0, 0(t7)     # t[i], zero-extended
jr    ra
nop
```

The trio now carries **two** pieces of type information at once, and
they have to agree:

- `sll … 1` says the elements are 2 bytes wide;
- `lhu` says each element is an unsigned halfword.

That agreement is your cross-check. A `sll … 2` feeding an `lhu` would
be nonsense (4-byte stride, 2-byte load) — if you ever think you're
seeing that, re-read the registers, because one of the two belongs to a
different computation. And as always, the load mnemonic is the type
oracle from last chapter: `lhu` here forced the `u16` in the C.

The target indexes a halfword array too, but its load is the *signed*
flavor, and the loaded value gets one piece of arithmetic done to it
before heading out — an idiom from the very start of this tier.

## Your task

Write `func_800aa190` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800aa190(s16 *wave, s32 i) {
    return wave[i] * 2;
}
```
