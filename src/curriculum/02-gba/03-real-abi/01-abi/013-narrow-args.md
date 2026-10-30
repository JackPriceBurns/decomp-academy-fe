---
id: 7b2f3c02-9548-45a7-bae8-572c561bd202
slug: gba-abi-narrow-args
title: Narrow Arguments at a Call Boundary
difficulty: 4
concepts:
  - abi
  - narrow-types
  - calls
symbol: func_0831306c
hints:
  - "There are three shift pairs, all `lsl #24` and `lsr #24`: two before the call and one after it. So both incoming values and the outgoing value have the same eight-bit unsigned width."
  - The function takes two `u8` parameters and returns a `u8`. The parameters reach `chan` in the opposite order from the one they arrived in, and the call's result has 1 added to it.
---

# Casts written as shift pairs

The ARM7TDMI has no sign-extend or zero-extend instruction. On this machine,
every narrowing cast is a pair of shifts. The first shift moves the value up to
the top of the register, and the second moves it back down. The second shift is
arithmetic if the type is signed and logical if it is unsigned:

    (u8)  lsl #24, lsr #24        (s8)  lsl #24, asr #24
    (u16) lsl #16, lsr #16        (s16) lsl #16, asr #16

Around a call, gcc narrows values more often than it strictly needs to. It
narrows an argument before the `bl`, even though the callee will narrow it
again on entry. It also narrows the returned value after the `bl`, even though
the callee narrowed it before returning. One call with byte-wide values can
cost four shift pairs.

```asm
0        push      {lr}
2        lsl       r1, r0, #1
4        add       r1, r0
6        lsl       r1, #16
8        asr       r1, #16
10       mov       r0, r1
12       bl        clampS16-4
16       lsl       r0, #16
18       asr       r0, #16
20       sub       r0, #4
22       pop       {r1}
24       bx        r1
```

The multiply by three is the usual shift and add. Then `lsl #16` and
`asr #16` truncate the value to sixteen signed bits, because that is what
`clampS16` takes. The identical pair at 16-18 truncates the sixteen signed bits
that came back, before anything else is done with them. Both pairs are casts
that you never wrote in the C.

The pair after a call is also where narrow types get hard to read, because gcc
can merge other arithmetic into the shift count:

```asm
0        push      {lr}
2        lsl       r0, #24
4        lsr       r0, #24
6        bl        fade-4
10       lsl       r0, #24
12       lsr       r0, #23
14       pop       {r1}
16       bx        r1
```

`lsl #24` followed by `lsr #23` does not match any type width. It is a cast to
`u8` followed by a multiply by two. gcc does the doubling inside the shift that
was already there. When the second shift of a pair is one less than the first,
look for a factor of two in the source.

## Your task

`extern u8 chan(u8 c, u8 amt);` is declared for you. Write `func_0831306c` to
reproduce the target assembly.

<!-- context -->
```c
extern u8 chan(u8 c, u8 amt);
```

<!-- solution -->
```c
u8 func_0831306c(u8 a, u8 b) {
    return chan(b, a) + 1;
}
```
