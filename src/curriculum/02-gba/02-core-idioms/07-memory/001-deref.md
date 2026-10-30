---
id: 9ec07a48-b919-4e5a-9128-6266b7c3bcab
slug: gba-memory-deref
title: Reading Through a Pointer
difficulty: 1
concepts:
  - pointers
  - loads
  - addressing
symbol: func_081f536c
hints:
  - "Every `ldr rD, [rB, #0]` in the listing is one `*` in the C. Count them to find how many of the arguments are addresses."
  - There are two `s32 *` parameters and an `s32` return value. The order of the registers in the `sub` is the order of the operands in the C.
---

# The register holds an address

A pointer parameter arrives like any other argument: in `r0`, `r1`, `r2` or
`r3`, one register each. The difference is what the register holds. An `s32`
argument arrives with the value itself in the register. A pointer arrives with
an *address*, and the value is in memory at that address. Reading the value
takes one instruction.

That instruction is `ldr`:

```asm
0        ldr       r0, [r0, #0]
2        add       r0, #7
4        bx        lr
```

The brackets are the dereference. `ldr r0, [r0, #0]` reads the 32-bit word at
the address in `r0` and writes it into `r0`. The address is overwritten by the
value it pointed to. After that, the `add` uses it like any other value. The
`#0` is a byte offset that is added to the base address before the load. A
plain `*p` does not skip any bytes, so the offset is zero.

Nothing else marks a register as holding a pointer. There is no separate set of
pointer registers and no tag. The only evidence is that the code loads through
the register. Here the address is the second argument:

```asm
0        ldr       r1, [r1, #0]
2        add       r0, r1
4        bx        lr
```

`r0` goes straight into the arithmetic, so the first argument is a value.
`r1` appears inside brackets first, so the second argument is an address. That
difference tells you the whole signature. Reading it from the brackets is a
habit to build now.

Your target reads from memory before it does any arithmetic. The brackets tell
you which arguments are addresses.

## Your task

Write `func_081f536c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081f536c(s32 *a, s32 *b) {
    return *a - *b;
}
```
