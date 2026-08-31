---
id: 023ea28d-51e5-430a-8dfb-55371fad22c0
slug: foundations-immediate
title: "Immediates: Math With Constants"
difficulty: 1
concepts:
  - arithmetic
  - immediates
symbol: adjust
hints:
  - "Adding a constant uses the immediate form `addiu` — the constant rides inside the instruction."
  - "The `u` doesn't mean unsigned; plain signed `s32` addition compiles to `addiu`."
---

# Folding a constant into the instruction

Adding a small constant is free of any load. The compiler folds the number
straight into the instruction with the immediate form `addiu rt, rs, imm` —
`imm` being the literal value, riding along inside the opcode:

```asm
addiu v0, a0, 5    # v0 = a0 + 5
jr    ra
nop
```

One instruction: take the first argument, add 5, and the sum is already sitting
in the return register.

Two things about `addiu` are worth filing away early:

- **The `u` does not mean unsigned.** It means "never trap on overflow" — a
  hardware detail. Ordinary signed C arithmetic compiles to the `u` forms, so
  `addiu` on an `s32` is completely normal. Expect `u`-suffixed instructions
  everywhere.
- **The immediate field is signed and 16 bits wide**, reaching from -32768 up to
  32767. Ask for a constant beyond that and the compiler builds it separately —
  a `lui`/`ori` pair into the scratch register `at`, then a register-to-register
  add. Won't happen in this exercise, but file the shape away.

And because the field is signed, the very same `addiu` can *subtract* too —
that's the next lesson.

Whatever immediate the target `addiu` carries is the constant you are after.

## Your task

Write `adjust`, taking an `s32 x`, so it compiles to the target `addiu`
instruction.

<!-- starter -->
```c
s32 adjust(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 adjust(s32 x) {
    return x + 1;
}
```
