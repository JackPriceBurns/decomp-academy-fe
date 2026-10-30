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
  - "Adding a constant uses the immediate form `addiu`, which stores the constant inside the instruction."
  - "The `u` doesn't mean unsigned; plain signed `s32` addition compiles to `addiu`."
---

# Folding a constant into the instruction

Adding a small constant does not need a separate load. The compiler puts the
number straight into the instruction, using the immediate form
`addiu rt, rs, imm`. Here `imm` is the constant itself, stored as part of the
instruction:

```asm
addiu v0, a0, 5    # v0 = a0 + 5
jr    ra
nop
```

This is one instruction. It takes the first argument, adds 5, and writes the
sum straight into the return register.

Two things about `addiu` are worth knowing early:

- **The `u` does not mean unsigned.** It means the instruction never traps on
  overflow, which is a hardware detail. Ordinary signed C arithmetic compiles
  to the `u` forms, so `addiu` on an `s32` is normal. You will see instructions
  ending in `u` everywhere.
- **The immediate field is signed and 16 bits wide.** It holds values from
  -32768 to 32767. For a constant outside that range, the compiler builds the
  value separately: a `lui`/`ori` pair loads it into the scratch register `at`,
  and then a register-to-register add uses it. That won't happen in this
  exercise, but it is worth knowing the pattern.

Because the field is signed, the same `addiu` can also *subtract*. The next
lesson covers that.

The immediate in the target's `addiu` is the constant you need.

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
