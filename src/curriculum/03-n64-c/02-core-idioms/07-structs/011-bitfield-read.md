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
  - "Left-shift amount = bits above the field; 32 minus the right-shift amount = the field's width. Solve both, then find the matching field in `Ctl`."
  - "It's `sra` coming back down, and the fields are declared `s32` — a signed slice, returned as-is. One return line."
---

# The shift pair, aimed at a slice

Bitfields pack several tiny values into one word, and *reading* one
compiles to a pattern you already own: the left-then-right shift pair
from the width chapter, cutting a slice out of the middle of a
register. The layout rule that makes it decodable: **fields fill the
word from the most significant bit down**, in declaration order. So:

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

The two shift amounts are a pair of simultaneous equations handing you
the layout:

- **`sll` amount = how many bits sit *above* the field** (here `top`'s
  8);
- **32 − `sra` amount = the field's width** (32 − 20 = 12).

`sra` because the fields are declared `s32` — a signed slice keeps its
sign. Unsigned bitfields ride `srl` instead, and when an unsigned
field fits entirely in the word's first *byte*, IDO gets clever and
compiles the read as `lbu` plus `andi` — a narrowed load instead of
shifts. File that variant away; the shift pair is the general shape.

The target reads one field of the `Ctl` below. Solve the two equations
from its shift amounts, check them against the declaration, and name
the field.

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
