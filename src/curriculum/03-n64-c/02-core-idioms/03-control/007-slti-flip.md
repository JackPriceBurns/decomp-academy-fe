---
id: ad2fea18-a7e3-4c20-938f-81423c457fd0
slug: control-slti-flip
title: "slti and the xori Flip"
difficulty: 2
concepts:
  - compare
  - booleans
  - immediates
  - fingerprints
symbol: func_8034bfa8
hints:
  - "`slti K` followed by `xori 1` means the C tested `> K-1`. Recover K from
    the immediate, subtract one, and write the greater-than comparison."
  - "Don't write the xori yourself. A plain `>` comparison in C produces both instructions."
---

# Less-than has an immediate form, greater-than does not

Comparing with a constant has its own instruction: `slti`, "set on less than
immediate". `return x < 10;` is a single line:

```asm
slti v0, a0, 10    # v0 = (x < 10) ? 1 : 0
jr   ra
nop
```

(And `x < 0` compiles to the very short `slti v0, a0, 0`. This gives you the
sign as a boolean, without the shift tricks from the last chapter.)

As with `slt`, there is no greater-than form, and with an immediate there is
no second register to swap. Here is what IDO does with `return x > 10;`:

```asm
slti v0, a0, 11    # v0 = (x < 11) ? 1 : 0, which is x <= 10
xori v0, v0, 0x1   # flip the low bit: 1 becomes 0, 0 becomes 1
jr   ra
nop
```

There are two things to remember here:

- **The constant is off by one.** `x > 10` asks the same question as
  `x >= 11`, and its *negation* is `x < 11`. So the `slti` holds **K + 1**
  instead of K.
- **`xori 0x1` is the boolean NOT.** The result of `slti` is always 0 or 1,
  and XOR with 1 flips exactly that bit. Whenever a compare instruction is
  followed by `xori d, d, 0x1`, the C tested the *opposite* of what the
  compare computed.

So the pattern is: `slti K` + `xori 0x1` ⇒ the C said `> K-1`. Use that rule
on the target. Watch for the off-by-one, and let the compiler produce the
flip.

## Your task

Write `func_8034bfa8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8034bfa8(s32 t) {
    return t > 40;
}
```
