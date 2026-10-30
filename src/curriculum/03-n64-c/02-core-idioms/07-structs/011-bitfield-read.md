---
id: f043b2cc-6235-4bf6-8b28-13ef7418bf03
slug: structs-bitfield-read
title: "Bitfields: Reading a Slice"
difficulty: 4
concepts:
  - bitfields
  - shifts
  - sign-extension
symbol: func_80010ec8
hints:
  - "The left-shift amount is the number of bits above the field. 32 minus the right-shift amount is the field's width. Work out both, then find the matching field in `Ctl`."
  - "The shift back down is `sra`, and the fields are declared `s32`. It is a signed slice, returned without any change. The body is one return line."
---

# The shift pair, aimed at a slice

Bitfields pack several small values into one word. *Reading* one compiles to a
pattern you already know: the left-then-right shift pair from the Types &
Width chapter, used to cut a slice out of the middle of a register. To decode
it, you need one layout rule: **fields fill the word from the most significant
bit down**, in declaration order. For example:

```c
typedef struct {
    s32 top : 8;    // bits 31..24
    s32 val : 12;   // bits 23..12
    s32 pad : 12;   // bits 11..0
} Meas;

s32 get_val(Meas *m) {
    return m->val;
}
```

```asm
lw    v0, 0(a0)     # the whole packed word
sll   t6, v0, 8     # throw away the 8 bits above val…
sra   v0, t6, 20    # …then 32-12=20 back down: val, sign-extended
jr    ra
nop
```

The two shift amounts give you two equations, and together they tell you the
layout:

- **`sll` amount = the number of bits *above* the field** (here, the 8 bits
  of `top`);
- **32 − `sra` amount = the field's width** (32 − 20 = 12).

The right shift is `sra` because the fields are declared `s32`, and a signed
slice keeps its sign. Unsigned bitfields use `srl` instead. When an unsigned
field fits entirely in the first *byte* of the word, IDO compiles the read as
`lbu` plus `andi`. That is a narrower load in place of the shifts. This
variant is worth remembering, but the shift pair is the general shape.

The target reads one field of the `Ctl` below. Solve the two equations using
its shift amounts. Then check the result against the declaration and name the
field.

## Your task

Write `func_80010ec8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80010ec8(Ctl *c) {
    return c->delta;
}
```

<!-- context -->
```c
typedef struct {
    s32 mode : 6;
    s32 delta : 10;
    s32 rest : 16;
} Ctl;
```
