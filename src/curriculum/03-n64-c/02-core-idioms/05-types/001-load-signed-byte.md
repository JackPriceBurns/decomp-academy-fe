---
id: 5b799d8d-2666-4b6c-a47f-256bfeeee7e7
slug: types-load-signed-byte
title: "lb: One Byte, Sign and All"
difficulty: 1
concepts:
  - types
  - loads
  - sign-extension
symbol: func_802de674
hints:
  - "One load, one arithmetic op. The multiply-by-a-power-of-two idiom from the arithmetic chapter applies."
  - "IDO computes into a scratch register and copies to `v0` with an `or` — that trailing copy is normal, not an extra C statement."
---

# Smaller than a word

Everything you've loaded so far was a 32-bit word. Game data rarely has
that luxury — health fits in a byte, coordinates in a halfword — and MIPS
has a load instruction per width. The catch: registers are always 32 bits,
so every narrow load must answer a question — *what fills the other 24
bits?*

For a **signed** byte the answer is: copies of the sign bit, so the value
keeps its meaning. That's `lb` — load byte, sign-extended. Here's `peek`,
returning the fourth byte of a signed byte array:

```c
s32 peek(s8 *src) {
    return src[3];
}
```

```asm
lb    v0, 3(a0)     # v0 = src[3], sign-extended to 32 bits
jr    ra
nop
```

One instruction. A byte like `0xFB` (-5) comes out of memory as
`0xFFFFFFFB` (still -5) — the register-sized truth of the same number.
Note the offset does the indexing: `src[3]` on a byte array is just
`3(a0)`, no shifting, because bytes have stride 1. (Compare the word
arrays of last chapter, striding by 4.)

The type story runs deeper than convenience: the `s8` in the C is *why*
the compiler picked `lb`. Narrow loads are **type oracles**, the way
`sra`/`srl` and `div`/`divu` were — the mnemonic in the target tells you
what to declare, and a wrong declaration shows up as one stubborn mnemonic
mismatch in the diff.

The target loads a byte and does one small piece of arithmetic on it —
loaded values feed the same idioms you've been compiling all tier.

## Your task

Write `func_802de674` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802de674(s8 *p) {
    return *p * 2;
}
```
