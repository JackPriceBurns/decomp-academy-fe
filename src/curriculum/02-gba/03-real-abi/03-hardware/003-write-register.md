---
id: c127b303-8a6e-4c4c-8f52-25d20e933bb6
slug: gba-hardware-write-register
title: Writing a Hardware Register
difficulty: 3
concepts:
  - hardware
  - constants
  - literal-pool
symbol: func_0835ef20
hints:
  - The `.word` at the end is far too small to be an address. That tells you
    which of this function's two constants went to the pool, and therefore what
    the `mov`/`lsl` pair at the top must be.
  - "Nothing goes in and nothing comes out. The address is 128 << 19 =
    0x04000000, the display control register, and the value stored is 1027."
---

# Two constants, built separately

A store to a hardware register needs two numbers: the address and the value.
The compiler treats them as separate problems. It builds each one with
whichever of its three methods fits: an eight-bit `mov`, a `mov`/`lsl` pair, or
a word in the literal pool. Either constant can end up in the pool. In a lot of
real GBA code, the address is the cheaper one to build.

Here is a write of `0x1E00` to `BG0CNT` at `0x04000008`:

```asm
0        ldr       r1, [pc, #8] (->12)
2        mov       r2, #240
4        lsl       r2, #5
6        mov       r0, r2
8        strh      r0, [r1, #0]
10       bx        lr
12       .word     67108872
```

The address, 67108872, is not a byte times a power of two, so it needs a pool
word. The value is cheaper: 0x1E00 is 240 << 5, so it takes two instructions
and no memory access. Then `strh r0, [r1, #0]` writes the low sixteen bits of
`r0` to the address in `r1`.

The `mov r0, r2` at offset 6 often confuses people. gcc built the constant in
`r2` and then copied it into `r0` to store it. That copy is a wasted
instruction. It is still in the object file, so it is part of the match. The
pattern is consistent. Only a value that fits in a single `mov` immediate is
built straight into the register the store uses. Anything wider (a `mov`/`lsl`
pair, or a word loaded from the pool) is built in a scratch register and then
copied:

```asm
0        ldr       r1, [pc, #4] (->8)
2        mov       r0, #8
4        strh      r0, [r1, #0]
6        bx        lr
8        .word     67108948
```

This one writes 8 to `BLDY` at `0x04000054`, and there is no copy.

Your target has the same structure with the roles swapped: the address is built
inline and the value comes from the pool.

## Your task

Write `func_0835ef20` to reproduce the target assembly.

<!-- solution -->
```c
void func_0835ef20(void)
{
    *(vu16 *)0x04000000 = 0x0403;
}
```
