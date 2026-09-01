---
id: 073a8099-8d1b-4b4f-90e8-033e74ab5284
slug: gba-division-umodulo
title: Unsigned Remainder
difficulty: 2
concepts:
  - division
  - helper-calls
  - signedness
symbol: func_0809c5a8
hints:
  - The `add` runs before the call, so it changes what the helper receives rather
    than what it returns.
  - Two `u32` parameters in, a `u32` out. One more than the first, taken modulo
    the second.
---

# One unsigned operand is enough

`__umodsi3` is the unsigned remainder, and it pairs with `__udivsi3` exactly as
`__modsi3` pairs with `__divsi3`. What is worth pinning down here is how gcc
decides which of the two to call, because the answer is C's conversion rules
rather than anything about the machine.

If either operand is `unsigned int`, the usual arithmetic conversions make the
other one unsigned too, and the whole operation becomes unsigned. So a signed
value taken modulo four times an unsigned one compiles to this:

```asm
0        push      {lr}
2        lsl       r1, #2
4        bl        __umodsi3-4
8        pop       {r1}
10       bx        r1
```

Make both declarations signed and the same function becomes:

```asm
0        push      {lr}
2        lsl       r1, #2
4        bl        __modsi3-4
8        pop       {r1}
10       bx        r1
```

The consequence for decompiling is that `__umodsi3` proves the *operation* was
unsigned and does not prove that both declarations were. A `u32` divisor is
enough to drag a perfectly signed dividend along with it. When you meet one of
these in real code, the surrounding uses of each value — what else indexes with
it, what else compares it — decide which spelling to write. With nothing else to
go on, make them both unsigned and move on.

Both listings above also sharpen the reading rule from earlier in the chapter.
The `lsl` runs before the `bl`, so it is setup rather than follow-up, and it
writes `r1` — the register the helper takes its divisor from — so the multiply
by four belongs to the divisor. Position tells you whether an instruction is
setup or follow-up; the register tells you which operand it is setting up. Your
target has one instruction of its own to place.

## Your task

Write `func_0809c5a8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0809c5a8(u32 i, u32 n) {
    return (i + 1) % n;
}
```
