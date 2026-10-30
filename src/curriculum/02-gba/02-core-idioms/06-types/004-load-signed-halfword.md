---
id: 3019bcca-1250-4b42-8172-c1ea1bc027b2
slug: gba-types-load-signed-halfword
title: The Register-Offset ldrsh
difficulty: 2
concepts:
  - narrow-types
  - sign-extension
  - loads
symbol: func_081bf9fc
hints:
  - The constant in each `mov` is the byte offset of that load, so halve it to
    get the subscript. Two `mov`s means two signed halfword reads.
  - "The function takes one `s16 *` and returns an `s32`. The result is built
    from the elements at byte offsets 2 and 8."
---

# Using a register for the offset

Signed halfwords have their own load instruction. `ldrsh` reads 16 bits and
sign-extends them into the register in a single step. However, it only exists
in some forms. ARMv4T encodes `ldrsh` and `ldrsb` only in the register-offset
form `ldrs* rD, [rB, rI]`. There is no `ldrsh rD, [rB, #imm]`.

So agbcc first puts the offset into a register. Reading `p[5]` from an `s16 *`
looks like this:

```asm
0        mov       r1, #10
2        ldrsh     r0, [r0, r1]
4        add       r0, #1
6        bx        lr
```

`mov r1, #10` does no arithmetic. It places the byte offset of element 5 in a
register that the load can use. The offset has to go in the index register,
because the instruction has no room for it. When you see `mov rX, #N` right
before an `ldrsh`, it is part of the address, and `N / 2` is the subscript.

Here is the same function reading through an `s8 *`:

```asm
0        ldrb      r0, [r0, #5]
2        lsl       r0, #24
4        asr       r0, #24
6        add       r0, #1
8        bx        lr
```

The narrower type produces longer code. gcc's pattern for sign-extending a
halfword has a spare operand that it can put a register into, so it can always
use `ldrsh`. The pattern for a byte has no such operand. So a signed byte is
normally read with the shift pair you met two lessons ago. This difference
is specific to ARMv4T, and it means `s8` and `s16` fields are read with very
different code.

This gives you a useful shortcut. Count the `mov rX, #N` instructions that feed
an `ldrsh`. That count is the number of signed halfword reads in the function,
and you get it without reading any of the loads.

Your target has two of these reads.

## Your task

Write `func_081bf9fc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081bf9fc(s16 *p) {
    return p[1] - p[4];
}
```
