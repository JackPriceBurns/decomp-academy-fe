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
  - "There are two `sll`s by 1, and they do different jobs. The first scales the index. The second is arithmetic on the loaded value."
  - "The load is `lh`, not `lhu`, so use it to choose the element type of the pointer. The final `or` into `v0` is IDO's usual copy-out and does not come from a C statement."
---

# The sll amount is the element size

If you change the element type, exactly one number changes in the indexing
trio: the shift amount. A `u16` array has a stride of 2, so the index is
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

The trio now gives you **two** pieces of type information, and they have to
agree:

- `sll … 1` says the elements are 2 bytes wide;
- `lhu` says each element is an unsigned halfword.

Use this agreement to check your reading. A `sll … 2` feeding an `lhu` would
make no sense (a 4-byte stride with a 2-byte load). If you think you see that,
read the registers again, because one of the two instructions belongs to a
different computation. As in the last chapter, the load mnemonic is your type
oracle: here `lhu` forced the `u16` in the C.

The target also indexes a halfword array, but its load is the *signed* form.
The loaded value then goes through one arithmetic step before it leaves the
function. That step is an idiom from the very start of this tier.

## Your task

Write `func_800aa190` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800aa190(s16 *wave, s32 i) {
    return wave[i] * 2;
}
```
