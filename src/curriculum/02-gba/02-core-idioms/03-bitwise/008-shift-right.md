---
id: e1255d2b-f46d-4b77-8baf-e945c86dfa34
slug: gba-bitwise-shift-right
title: Two Ways to Shift Right
difficulty: 2
concepts:
  - shifts
  - signedness
  - types
symbol: func_080edbb0
hints:
  - The two shifts use different mnemonics, and the mnemonic is decided by the
    declared type of the value being shifted. So the two parameters have
    different types.
  - The function takes two arguments and returns an `s32`. The first parameter
    is signed and the second is not. Each is shifted right by its own amount,
    and the two results are added.
---

# lsr and asr

Right shifts come in two kinds. `lsr` shifts zeros in at the top, and `asr`
shifts in copies of the sign bit. With the same count and the same register,
they give different answers for any value that has bit 31 set:

```asm
0        lsr       r0, #6
2        bx        lr
```

```asm
0        asr       r0, #6
2        bx        lr
```

Those are the same C expression, `a >> 6`, compiled twice. The only difference
is the declared type of `a`.

That is the whole rule, and it is worth stating exactly. The mnemonic is decided
by the *static type* of the left operand. What the compiler can prove about the
value makes no difference. A `u32` gets `lsr`, an `s32` gets `asr`, and a plain
hex literal gets `asr`, because a literal that fits in `int` is an `int`. A
single `u` suffix or a single cast changes the mnemonic. So when a right shift
does not match, check the declared type before you change anything else.

A related trap is division. A signed `>>` is one instruction, but a signed `/`
by the same power of two is not:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #63
6      ~>asr       r0, #6
8        bx        lr
```

That is `a / 64` on an `s32`. C rounds division toward zero, so a negative
dividend has to be increased by 63 first, and gcc 2.9 does this with a real
branch. On unsigned types the two forms give the same code: `/ 64` and `>> 6`
both compile to a single `lsr`. On signed types, picking the wrong one costs
three extra instructions.

Your target contains both mnemonics. Read each one as a statement about the
type of the value it shifts.

## Your task

Write `func_080edbb0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080edbb0(s32 a, u32 b) {
    return (a >> 3) + (b >> 5);
}
```
