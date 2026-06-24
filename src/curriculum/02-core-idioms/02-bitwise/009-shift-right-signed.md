---
id: bitwise-shift-right-signed
title: Arithmetic Right Shift (Signed)
difficulty: 3
concepts:
  - bitwise
  - shifts
  - signed
  - srawi
symbol: asr3
hints:
  - A signed right shift preserves the sign — use the algebraic shift.
  - "`x >> 3` on an s32 compiles to `srawi r3, r3, 3`."
  - The type, not the operator, picks `srawi` over `srwi`.
---

# `srawi` — shift right, fill with the sign

Right-shifting a **signed** value is an *arithmetic* shift: the vacated high bits
are filled with copies of the sign bit, so a negative number stays negative. This
needs a dedicated instruction, **`srawi`** (shift right algebraic word
immediate). For example, shifting a signed value right by 5:

```asm
srawi   r3,r3,5
blr
```

Notice this is a *real* opcode, not an `rlwinm` mnemonic — sign extension cannot
be done with a rotate-and-mask. The signed/unsigned distinction is invisible in
the C operator (`>>` either way) and decided **entirely by the operand's type**:
`srwi` for `u32`, `srawi` for `s32`.

When the shift *amount* is a variable instead of a constant, you get the
register-form `sraw`/`srw`/`slw` — the next lesson.

Look at the shift count in the target `srawi` and the declared type of the
parameter; those two facts are all you need.

## Your task

Write `asr3` so it compiles to the `srawi` above.

<!-- starter -->
```c
s32 asr3(s32 x) {
    return 0;
}
```

<!-- solution -->
```c
s32 asr3(s32 x) {
    return x >> 3;
}
```
