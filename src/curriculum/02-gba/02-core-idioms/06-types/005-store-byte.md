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
  - Nothing masks the value before any of the three stores. Each store writes
    the low eight bits of whatever the register holds at that point.
  - "The arguments are a `u8 *` and an `s32`, and there is no return value. The
    same `s32` reaches all three stores, shifted right a little further each
    time."
---

# The store truncates for free

Writing to a `u8` keeps the low eight bits of a value and discards the rest.
`strb` does exactly that. It takes a 32-bit register, writes its bottom byte to
memory, and ignores everything above bit 7. Nothing masks, shifts or clamps the
value first.

So assigning to a narrow lvalue costs nothing, and this changes how the code
around it looks. The compiler does the arithmetic in full 32-bit registers until
the store, and the store does the narrowing:

```asm
0        add       r3, r1, r2
2        strb      r3, [r0, #0]
4        sub       r1, r2
6        strb      r1, [r0, #5]
8        bx        lr
```

This is a sum and a difference of two full-width values, each written directly
into a byte. If either result is larger than 255, the store drops the extra
bits. C defines the same behaviour: assigning an `int` to a `u8` keeps the low
eight bits.

The immediate is a byte count again, so `[r0, #5]` is element five. Truncation
does not depend on sign, so `strb` is exactly the same for `s8` and `u8`
destinations. A store on its own can never tell you which type the original
code used.

Your target writes three bytes from one value, and each store gets a different
part of that value. Read what goes into each store.

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
