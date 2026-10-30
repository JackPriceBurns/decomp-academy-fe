---
id: 53ffb291-f421-4d4a-b3f4-0e6df876b155
slug: gba-division-no-instruction
title: There Is No Divide Instruction
difficulty: 2
concepts:
  - division
  - helper-calls
  - calling-convention
hints:
  - Neither operand arrives in the register the helper needs, so both are
    copied. Work out which incoming register becomes the dividend and which
    becomes the divisor.
  - Three `s32` parameters in, an `s32` out. The first parameter is never used.
symbol: func_0808f114
---

# The instruction that does not exist

The ARM7TDMI has a multiplier but no divider. No instruction produces a
quotient. So gcc passes every division it cannot replace with cheaper
instructions to a helper routine in libgcc. For signed 32-bit operands that
routine is `__divsi3`. When you see that name in a listing, you are looking at a
division.

The helper takes its arguments in the normal way: the dividend in `r0` and the
divisor in `r1`. It returns the quotient in `r0`. The first two parameters of a
function already arrive in those registers. So a function that divides its
first argument by its second needs no setup at all:

```asm
0        push      {lr}
2        bl        __divsi3-4
6        pop       {r1}
8        bx        r1
```

Only one of those four instructions does the division. The others are the cost
of making a call. `push {lr}` is there because `bl` overwrites the link
register, so a function that calls anything must save its own return address
first. Returning has one more detail. This course builds with interworking,
which does not allow popping straight into `pc`. Instead, the return address is
popped into a scratch register and `bx` jumps to it. You will see this frame
around every helper call in this chapter.

Look at the address column too. Thumb instructions are two bytes long, so
addresses normally go up by two. But `bl` is a four-byte instruction, which is
why address 2 is followed by address 6.

## What the `-4` means

`bl __divsi3-4` does not call an address four bytes before the helper. This
object file has not been linked yet, so the call target is still an unresolved
relocation. The disassembler prints the relocation's addend next to the symbol
name. That addend is the Thumb PC bias, and it is always `-4`. Read any
`bl name-4` as "call `name`". The `-4` never appears in your C.

## The registers are fixed

There is only one way to pass values to `__divsi3`. When the operands are in
other registers, the compiler moves them. Here is a function that divides a
constant by its argument:

```asm
0        push      {lr}
2        mov       r1, r0
4        mov       r0, #100
6        bl        __divsi3-4
10       pop       {r1}
12       bx        r1
```

The argument arrives in `r0`, but here it is the divisor. So it is copied into
`r1` before `r0` is overwritten with the numerator. The order of those two
`mov`s cannot change. If they ran the other way round, the argument would be
destroyed before it was saved.

Every `mov` in front of a `bl __divsi3` tells you where one of the operands came
from. Read them backwards to work out which value was the dividend and which was
the divisor. The target below has two of them.

## Your task

Write `func_0808f114` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0808f114(s32 a, s32 b, s32 c) {
    return b / c;
}
```
