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
  - "Three shift pairs, all `lsl #24` / `lsr #24` — two before the call and one after — so both incoming values and the outgoing value are the same eight-bit unsigned width."
  - Two `u8` parameters in, a `u8` out. The parameters reach `chan` in the opposite order to the one they arrived in, and the call's result has 1 added to it.
---

# Shifts that are really casts

The ARM7TDMI has no sign-extend or zero-extend instruction. Every narrowing on
this machine is a pair of shifts: push the value up to the top of the register
and drag it back down, arithmetically if it is signed and logically if it is
not.

    (u8)  lsl #24, lsr #24        (s8)  lsl #24, asr #24
    (u16) lsl #16, lsr #16        (s16) lsl #16, asr #16

Around a call gcc is thorough to the point of paranoia. It narrows an argument
before the `bl` even though the callee will narrow it again on entry, and it
narrows the returned value after the `bl` even though the callee narrowed it
before returning. A single byte-wide call can burn four shift pairs.

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

The multiply by three is the usual shift-and-add. Then `lsl #16` / `asr #16`
truncates it to sixteen signed bits because that is what `clampS16` takes, and
the identical pair at 16-18 truncates the sixteen signed bits that came back
before anything is done with them. Both pairs are casts you never wrote.

The second pair is also where narrow types get genuinely hard to read, because
gcc folds other arithmetic into the shift count:

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

`lsl #24` then `lsr #23` corresponds to no width at all. It is a cast to `u8`
followed by a multiply by two, with the doubling absorbed into the shift that
was already happening. Whenever a shift pair comes back one short, look for a
factor of two in the source.

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
