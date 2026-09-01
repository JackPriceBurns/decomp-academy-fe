---
id: 9073c322-dadf-4209-9de3-f29824dc1cb9
slug: gba-types-store-byte
title: Storing a Byte
difficulty: 2
concepts:
  - narrow-types
  - stores
  - shifts
symbol: func_081c4170
hints:
  - Nothing masks the value before any of the three stores, so each store is
    writing the low eight bits of whatever the register happens to hold.
  - "A `u8 *` and an `s32`, no return value - the same `s32` reaches all three
    stores, shifted down a little further each time."
---

# The store that truncates for free

Writing to a `u8` needs the low eight bits of a value and discards the rest.
`strb` does exactly that: it takes a 32-bit register, writes its bottom byte to
memory and ignores everything above bit 7. No mask, no shift, no clamp.

That makes assignment into a narrow lvalue free, and it changes how the
surrounding arithmetic looks. The compiler computes in full 32-bit registers
right up to the store, and lets the store do the narrowing:

```asm
0        add       r3, r1, r2
2        strb      r3, [r0, #0]
4        sub       r1, r2
6        strb      r1, [r0, #5]
8        bx        lr
```

A sum and a difference of two full-width values, each written straight into a
byte. If either result exceeded 255 the extra bits are dropped by the store, and
the C says so too - assigning an `int` to a `u8` is defined to keep the low
eight bits.

The immediate is a byte count again, so `[r0, #5]` is element five. And because
truncation carries no sign, `strb` is byte-for-byte identical for `s8` and `u8`
destinations. A store alone can never tell you which one the original code used.

Your target writes three bytes from one value, and each store gets a different
part of it. Read what feeds each store.

## Your task

Write `func_081c4170` to reproduce the target assembly.

<!-- solution -->
```c
void func_081c4170(u8 *p, s32 n) {
    p[0] = n;
    p[1] = n >> 8;
    p[2] = n >> 16;
}
```
