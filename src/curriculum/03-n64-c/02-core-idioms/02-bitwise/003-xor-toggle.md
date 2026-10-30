---
id: f3c08360-3fb2-429a-9ee4-9861c6aba01b
slug: bitwise-xor-toggle
title: "xori: Flipping Bits"
difficulty: 1
concepts:
  - bitwise
  - immediates
symbol: func_800f020c
hints:
  - "The `xori` immediate marks the bits that are flipped. The C operator is `^`,
    used with that constant."
  - "The target toggles two bits, and one constant names both of them."
---

# XOR as a toggle

XOR is the third mask operator. It gives a 1 where the two inputs *differ*.
With a constant, each 1 in the mask **flips** the matching input bit: a bit
that is on turns off, and a bit that is off turns on. The zeros in the mask
leave their bits unchanged.
The immediate form is `xori`. Here it inverts the low byte:

```asm
xori v0, a0, 0xff   # flip bits 0-7, keep the rest
jr   ra
nop
```

In C this is `x ^ 0xff`. If you apply it twice, you get the original value
back, because XOR undoes itself. That is why game code uses it for state that
switches back and forth, such as blinking visibility, directions that reverse,
and parity counters.

That completes the three mask operators. Here they are side by side, because
you need to tell them apart at a glance:

- `andi`: the mask's ones are the bits **kept**.
- `ori`: the ones are the bits **forced on**.
- `xori`: the ones are the bits **flipped**.

All three have the same encoding and the same zero-extended immediate. Only
the operation is different. When you decode one, the mnemonic tells you the C
operator, and the immediate goes into the C unchanged. There is nothing else
to work out.

## Your task

Write `func_800f020c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800f020c(s32 a) {
    return a ^ 0x30;
}
```
