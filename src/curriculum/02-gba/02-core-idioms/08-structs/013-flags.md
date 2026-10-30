---
id: c4aa1a00-a8fb-4239-b072-2b067907a0c7
slug: gba-structs-flags
title: Flag Bits in a Field
difficulty: 4
concepts:
  - structs
  - bitwise
  - types
symbol: func_0827241c
hints:
  - "`bic rD, rM` is `rD = rD & ~rM`. The compiler only uses it when the mask is a value rather than a constant. So the `~` in the C is applied to something the compiler cannot fold."
  - "The function takes a `struct Actor *` and a `u8`, and returns nothing. The `lsl #24` / `lsr #24` at the top is the ABI narrowing an argument that arrived in a whole register. You do not write it yourself."
---

# Setting and clearing bits in a byte

Most console structs keep their boolean values packed into a byte of flags. The
code that changes them is a load, one bitwise instruction and a store back. The
whole pattern fits in four instructions, and you will see it very often.

Setting a bit uses `orr`. The constant goes into a register first, because
Thumb's `orr` only works between registers:

```asm
0        ldrb      r2, [r0, #2]
2        mov       r1, #32
4        orr       r1, r2
6        strb      r1, [r0, #2]
8        bx        lr
```

When you clear a bit, the compiler does not produce what you might expect. ARM
has `bic` (bit clear), a single instruction that does the same as `a &
~b`. So `&= ~mask` looks like a natural use for it. Here is what a clear with a
constant mask actually compiles to:

```asm
0        ldrb      r2, [r0, #2]
2        mov       r1, #239
4        and       r1, r2
6        strb      r1, [r0, #2]
8        bx        lr
```

Both of those act on `d->bits`, a `u8` field at offset 2 of a four-byte struct.
The second one clears bit 4. Because the field is a byte, the compiler knows
the complement only has to be correct in eight bits. `~16` narrowed to a byte
is 239, which fits in a plain `mov #imm8`. The compiler can work out the
complement at compile time for free, so it uses `and`, and `bic` never appears.
Every constant clear on a byte field looks like this, with the *complement* of
the mask in the `mov`.

`bic` does appear in some code, and the rule for when is precise. The mask has
to be something the compiler cannot fold, so the complement has to be computed
at runtime. The target below does this. The two instructions in front of its
load tell you how wide that mask was.

## Your task

Write `func_0827241c` to reproduce the target assembly.

<!-- context -->
```c
struct Actor { u8 flags; u8 state; u16 timer; };
```

<!-- solution -->
```c
void func_0827241c(struct Actor *a, u8 m) {
    a->flags = a->flags & ~m;
}
```
