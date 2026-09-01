---
id: a8de2f28-966d-4ec8-86c0-8bdd12ba0e69
slug: gba-arithmetic-capstone-pool
title: "Capstone: Pool and Product"
difficulty: 5
concepts:
  - literal-pool
  - multiply
  - constants
symbol: func_0808a630
hints:
  - The `.word` at the bottom of the listing is the multiplier, printed in
    decimal. The `ldr` fetches it, and the `.hword 0` above it is alignment
    padding rather than an instruction.
  - "Two `s32` parameters in, an `s32` out. The second is multiplied by 12345 and
    the first is subtracted from that product."
---

# A multiplier too big to move

`mov rD, #imm8` reaches 255, and `mul` needs its operand in a register. So a
multiply by a large constant has two ways out: take the constant apart into
shifts and adds, or fetch the whole word from the literal pool and use the
multiplier. gcc weighs them the same way it weighed `mul` against a chain for
small constants — a multiply by 1000 still comes out as a copy and five shifts,
adds and subtracts, while less tractable values give up and go to the pool.

Here is `x * 54321 - y`:

```asm
0        ldr       r2, [pc, #4] (->8)
2        mul       r0, r2
4        sub       r0, r1
6        bx        lr
8        .word     54321
```

The multiplier is written out at address 8 in decimal, the `ldr` fetches it into
a scratch register, and the rest is the multiply-then-subtract shape from earlier
in the chapter. Read the `(->8)` the workspace prints rather than the `#4` in the
instruction — the arrow already resolves the PC-relative arithmetic for you and
points at the row holding the value.

Two things about that pool are worth carrying into your target.

The word has to start at an address that is a multiple of four. This function's
code happens to end at 8, so the constant sits directly after `bx lr` with
nothing between them. Code ending on an odd multiple of two gets a `.hword 0`
inserted first, and that padding row is part of the function you must reproduce
even though it never executes.

And the pool is emitted per function, after the code, so its rows always appear
at the bottom of the listing no matter where in the expression the constant was
used. A `.word` at the end of a listing is a constant the body needed, not
something that happens at the end.

Your target uses a pooled multiplier too, and where its product ends up is the
last thing left to work out.

## Your task

Write `func_0808a630` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0808a630(s32 a, s32 b) {
    return b * 12345 - a;
}
```
