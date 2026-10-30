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
  - The `add` runs before the call, so it changes a value the helper receives.
    It does not change what the helper returns.
  - Two `u32` parameters in, a `u32` out. One more than the first, taken modulo
    the second.
---

# One unsigned operand is enough

`__umodsi3` is the unsigned remainder helper. It pairs with `__udivsi3` in the
same way that `__modsi3` pairs with `__divsi3`. This lesson looks at how gcc
decides which of the two to call. The answer comes from C's conversion rules and
has nothing to do with the machine.

If either operand is `unsigned int`, the usual arithmetic conversions make the
other one unsigned too, and the whole operation is unsigned. So a signed value
taken modulo four times an unsigned value compiles to this:

```asm
0        push      {lr}
2        lsl       r1, #2
4        bl        __umodsi3-4
8        pop       {r1}
10       bx        r1
```

If both declarations are signed, the same function becomes:

```asm
0        push      {lr}
2        lsl       r1, #2
4        bl        __modsi3-4
8        pop       {r1}
10       bx        r1
```

For decompiling, this means `__umodsi3` proves that the *operation* was
unsigned. It does not prove that both declarations were. A `u32` divisor is
enough to make a signed dividend unsigned as well. When you find one of these in
real code, look at how each value is used elsewhere (what it indexes, what it is
compared with) to decide which type to write. With nothing else to go on, make
them both unsigned.

Both listings above also make the reading rule from earlier in the chapter more
precise. The `lsl` runs before the `bl`, so it is setup work for the call. It
writes `r1`, the register the helper takes its divisor from, so the multiply by
four belongs to the divisor. The position of an instruction tells you whether it
is setup (before the call) or follow-up (after it). The register it writes tells
you which operand it is setting up. Your target has one instruction of its own
for you to place.

## Your task

Write `func_0809c5a8` to reproduce the target assembly.

<!-- solution -->
```c
u32 func_0809c5a8(u32 i, u32 n) {
    return (i + 1) % n;
}
```
