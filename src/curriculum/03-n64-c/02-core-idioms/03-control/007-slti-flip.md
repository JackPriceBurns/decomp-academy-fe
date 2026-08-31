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
    the immediate, subtract one, and write the greater-than."
  - "Don't write the xori yourself — a plain `>` comparison in C produces both instructions."
---

# Less-than has an immediate. Greater-than doesn't.

Comparing against a constant gets its own instruction: `slti` — set on less
than immediate. `return x < 10;` is a single line:

```asm
slti v0, a0, 10    # v0 = (x < 10) ? 1 : 0
jr   ra
nop
```

(And `x < 0` compiles to the pleasingly minimal `slti v0, a0, 0` — the
sign-as-boolean, without the shift tricks of last chapter.)

But just like `slt`, there is no greater-than form — and with an immediate
there's nothing to swap. Watch what IDO does with `return x > 10;`:

```asm
slti v0, a0, 11    # v0 = (x < 11) ? 1 : 0   — that's x <= 10
xori v0, v0, 0x1   # flip the low bit: 1 becomes 0, 0 becomes 1
jr   ra
nop
```

Two moves, both worth memorizing:

- **The constant is off by one.** `x > 10` is the same question as
  `x >= 11`, whose *negation* is `x < 11`. So the `slti` carries **K + 1**,
  not K.
- **`xori 0x1` is the boolean NOT.** The result of `slti` is only ever 0
  or 1, and XOR-ing with 1 flips exactly that bit. Whenever a compare
  instruction is chased by `xori d, d, 0x1`, the C tested the *opposite* of
  what the compare computed.

So the fingerprint reads: `slti K` + `xori 0x1` ⇒ the C said `> K-1`. Run
that recipe on the target — mind the off-by-one, and let the compiler emit
the flip.

## Your task

Write `func_8034bfa8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8034bfa8(s32 t) {
    return t > 40;
}
```
