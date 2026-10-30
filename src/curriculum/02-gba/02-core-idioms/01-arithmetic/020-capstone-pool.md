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
    decimal. The `ldr` loads it. The `.hword 0` above it is alignment padding
    and is not an instruction.
  - The function takes two `s32` parameters and returns an `s32`. The second is
    multiplied by 12345, and the first is subtracted from that product.
---

# A multiplier too large for an immediate

`mov rD, #imm8` can only hold values up to 255, and `mul` needs its operand in
a register. So gcc has two options for a multiply by a large constant. It can
split the constant into shifts and adds, or it can load the whole word from the
literal pool and use the multiplier. gcc compares them in the same way it
compared `mul` with a chain for small constants. A multiply by 1000 still
becomes a copy plus five shifts, adds and subtracts. Values that do not split
well go to the pool.

Here is `x * 54321 - y`:

```asm
0        ldr       r2, [pc, #4] (->8)
2        mul       r0, r2
4        sub       r0, r1
6        bx        lr
8        .word     54321
```

The multiplier is written in decimal at address 8. The `ldr` loads it into a
scratch register, and the rest is the shape from earlier in the chapter: a
multiply followed by a subtract. Read the `(->8)` that the workspace prints,
and ignore the `#4` in the instruction. The arrow has already done the
PC-relative arithmetic for you, and it points at the row that holds the value.

Keep two things about that pool in mind for your target.

First, the word has to start at an address that is a multiple of four. This
function's code ends at 8, so the constant comes straight after `bx lr`, with
nothing between them. If the code ends on an odd multiple of two, a `.hword 0`
is inserted first. That padding row never runs, but it is still part of the
function you must reproduce.

Second, each function gets its own pool, placed after the code. So the pool rows
always appear at the bottom of the listing, wherever the constant was used in
the expression. A `.word` at the end of a listing is a constant that the body
needed. It does not mean that something happens at the end.

Your target also uses a multiplier from the pool. The last thing to work out is
where its product ends up.

## Your task

Write `func_0808a630` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0808a630(s32 a, s32 b) {
    return b * 12345 - a;
}
```
