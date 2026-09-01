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
    declared type of the value being shifted. That is two different parameter
    types.
  - Two arguments and an `s32` result — the first parameter is signed, the
    second is not, each shifted right by its own amount and the two added.
---

# lsr and asr

Right shifts come in two flavours. `lsr` feeds zeros in at the top; `asr`
feeds copies of the sign bit. Same count, same register, different answer for
any value with bit 31 set:

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

That is the whole rule, and it is worth being precise about: the mnemonic is
decided by the *static type* of the left operand, never by what the compiler can
prove about the value. A `u32` gets `lsr`, an `s32` gets `asr`, and a plain hex
literal gets `asr` because a literal that fits in `int` is an `int`. One `u`
suffix or one cast moves the mnemonic, so when a right shift mismatches, check
the declared type before you change anything else.

The trap next door is division. A signed `>>` is one instruction, and a signed
`/` by the same power of two is not:

```asm
0        cmp       r0, #0
2        bge       6 ~>
4        add       r0, #63
6      ~>asr       r0, #6
8        bx        lr
```

That is `a / 64` on an `s32`. C rounds division toward zero, so a negative
dividend has to be nudged up by 63 first, and gcc 2.9 does it with a real
branch. On unsigned types the two spellings do coincide — `/ 64` and `>> 6` are
both a bare `lsr` — but on signed types choosing the wrong one costs three
instructions.

Your target has both mnemonics in it. Read each one as a statement about the
type of the value it is shifting.

## Your task

Write `func_080edbb0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_080edbb0(s32 a, u32 b) {
    return (a >> 3) + (b >> 5);
}
```
