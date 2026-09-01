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
  - Both operands reach the helper in the wrong registers, so both get copied.
    Work out which incoming register ends up as the dividend and which as the
    divisor.
  - "Three `s32` parameters in, an `s32` out — and the first one is never touched."
symbol: func_0808f114
---

# The instruction that does not exist

The ARM7TDMI has a multiplier and no divider. Nothing in the instruction set
produces a quotient, so gcc hands every division it cannot fold away to a
helper routine in libgcc. For signed 32-bit operands that routine is
`__divsi3`, and its name in a listing is what a division looks like on this
machine.

The helper takes its arguments the ordinary way: dividend in `r0`, divisor in
`r1`, quotient back in `r0`. Those are the registers the first two parameters
already arrive in, so a function that divides its first argument by its second
needs no setup at all:

```asm
0        push      {lr}
2        bl        __divsi3-4
6        pop       {r1}
8        bx        r1
```

One of those four instructions is the division. The rest is the cost of making
a call. `push {lr}` appears because `bl` overwrites the link register, so a
function that calls anything has to save its own return address first. Coming
back out, the course builds with interworking, which forbids popping straight
into `pc`: the return address goes into a scratch register and `bx` jumps to
it. You will see this frame around every helper call in the chapter.

Read the address column while you are here. Thumb instructions are two bytes,
so addresses normally step by two — but `bl` is a four-byte instruction, which
is why address 2 is followed by address 6.

## The `-4` is not arithmetic

`bl __divsi3-4` does not call four bytes before the helper. This object has not
been linked, so the call target is still an unresolved relocation, and the
disassembler prints the relocation's addend beside the symbol name. That addend
is the Thumb PC bias and it is always `-4`. Read any `bl name-4` as "call
`name`" and move on; the `-4` never appears in your C.

## The registers are not negotiable

There is exactly one way to hand values to `__divsi3`, so when the operands are
somewhere else, the compiler moves them. Here is a function dividing a constant
by its argument:

```asm
0        push      {lr}
2        mov       r1, r0
4        mov       r0, #100
6        bl        __divsi3-4
10       pop       {r1}
12       bx        r1
```

The argument arrived in `r0`, but here it is the divisor, so it is copied into
`r1` before `r0` is overwritten with the numerator. The order of those two
`mov`s is forced — do it the other way round and the argument is destroyed
before it is saved.

Every `mov` in front of a `bl __divsi3` is a clue about where the two operands
came from. Read them backwards and you recover which value sat on which side of
the slash. The target below has two of them.

## Your task

Write `func_0808f114` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_0808f114(s32 a, s32 b, s32 c) {
    return b / c;
}
```
