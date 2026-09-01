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
  - '"`bic rD, rM` is `rD = rD & ~rM`. The compiler only reaches for it when the mask is a value rather than a constant, so the `~` in the C is on something it cannot fold.'
  - "A `struct Actor *` and a `u8` in, nothing out. The `lsl #24` / `lsr #24` at the top is the ABI narrowing an argument that arrived in a whole register, not anything you write."
---

# Setting and clearing bits in a byte

Most console structs keep their booleans packed into a byte of flags, and the
code that touches them is a load, one bitwise instruction, and a store back. The
whole idiom fits in four instructions and you will read it constantly.

Setting a bit is `orr`. The constant goes into a register first, because Thumb's
`orr` is register-to-register only:

```asm
0        ldrb      r2, [r0, #2]
2        mov       r1, #32
4        orr       r1, r2
6        strb      r1, [r0, #2]
8        bx        lr
```

Clearing one is where expectations go wrong. ARM has `bic` — bit clear, `a &
~b` in a single instruction — so `&= ~mask` looks like an obvious use for it.
Here is what a constant clear actually compiles to:

```asm
0        ldrb      r2, [r0, #2]
2        mov       r1, #239
4        and       r1, r2
6        strb      r1, [r0, #2]
8        bx        lr
```

Both of those act on `d->bits`, a `u8` field at offset 2 of a four-byte struct.
The second one clears bit 4. Because the field is a byte, the compiler knows the
complement only has to be right in eight bits, and `~16` narrowed to a byte is
239 — a plain `mov #imm8`. Complementing at compile time is free, so `and` wins
and `bic` never appears. Every constant clear on a byte field looks like this,
with the *complement* of the mask sitting in the `mov`.

`bic` does show up, and the condition for it is precise: the mask has to be
something the compiler cannot fold, so the complement has to happen at runtime.
That is what the target below does. The two instructions in front of its load
tell you how wide that mask was.

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
