---
id: b2bb95e1-b790-4190-9799-91ce31449de3
slug: pointers-diff
title: "Subtracting Pointers Hides a Divide"
difficulty: 3
concepts:
  - pointers
  - arithmetic
  - shifts
symbol: func_800aee54
hints:
  - "`subu` then an arithmetic right shift: byte distance divided down to
    an element count. The shift amount names the element size."
  - "The `subu`'s first operand is the pointer being subtracted *from* — match your parameter order to it. The whole function is one return of a pointer difference."
---

# end - start, in elements

C lets you subtract two pointers of the same type, and the result is
the number of *elements* between them — not bytes. The hardware only
knows bytes, so the compiler subtracts raw addresses and then divides
by the element size. For power-of-two sizes that divide is the signed
shift you learned in the arithmetic chapter:

```c
s32 hw_gap(s16 *a, s16 *b) {
    return a - b;
}
```

```asm
subu  v0, a0, a1    # raw byte distance
sra   t6, v0, 1     # ÷ 2 — elements, not bytes
or    v0, t6, zero
jr    ra
nop
```

A `subu` of two incoming pointers feeding an `sra` is the whole
fingerprint. Two readings to take from it:

- **The `sra` amount is the element size**, same encoding as the
  indexing `sll`: shift 1 = halfwords, shift 2 = words. The scale-up
  and scale-down instructions mirror each other across this chapter.
- **It's `sra`, not `srl`** — a pointer difference is *signed*
  (`ptrdiff_t`), because `a - b` is negative when `a` sits below `b`.
  You met this exact sra-for-signed-divide reasoning with `/ 2`; here
  the compiler applies it on your behalf.

You saw a cousin of this in the loops chapter, where `subu` of two
pointers manufactured a span length. Standing alone, it's usually a
helper like the target: how many elements sit between these two
pointers into the same word array?

## Your task

Write `func_800aee54` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800aee54(s32 *end, s32 *start) {
    return end - start;
}
```
