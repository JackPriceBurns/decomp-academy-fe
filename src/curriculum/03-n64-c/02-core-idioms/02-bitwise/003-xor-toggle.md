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
  - "`xori`'s immediate marks the bits being flipped — the C operator is `^`
    with that constant."
  - "Two bits are toggled in the target; the constant names both at once."
---

# XOR as a toggle

The third mask operator: XOR gives 1 where the inputs *differ*. Against a
constant, that means the mask's ones **flip** the corresponding input bits —
on becomes off, off becomes on — while the zeros pass through. The immediate
form is `xori`. Here's the low byte being inverted:

```asm
xori v0, a0, 0xff   # flip bits 0-7, keep the rest
jr   ra
nop
```

In C: `x ^ 0xff`. Run it twice and you'd get the original back — XOR undoes
itself, which is exactly why game code loves it for state that alternates:
blinking visibility, ping-pong directions, parity counters.

That completes the trio, and it's worth pinning the three side by side,
because reading them at a glance is the skill:

- `andi` — the mask's ones are the bits **kept**.
- `ori` — the ones are the bits **forced on**.
- `xori` — the ones are the bits **flipped**.

Same encoding, same zero-extended immediate, three different verbs. When
you're decoding, the mnemonic picks the C operator and the immediate rides
across unchanged — there's genuinely nothing else to derive.

## Your task

Write `func_800f020c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800f020c(s32 a) {
    return a ^ 0x30;
}
```
