---
id: 5b799d8d-2666-4b6c-a47f-256bfeeee7e7
slug: types-load-signed-byte
title: "lb: Loading a Signed Byte"
difficulty: 1
concepts:
  - types
  - loads
  - sign-extension
symbol: func_802de674
hints:
  - "There is one load and one arithmetic operation. The idiom for multiplying by a power of two, from the arithmetic chapter, applies here."
  - "IDO computes the result in a scratch register and then copies it to `v0` with an `or`. That final copy is normal. It does not come from an extra C statement."
---

# Smaller than a word

Everything you have loaded so far was a 32-bit word. Game data is often
smaller: health fits in a byte, and coordinates fit in a halfword. MIPS has a
separate load instruction for each width. Registers are always 32 bits wide,
though, so every narrow load has to decide what goes in the other 24 bits.

For a **signed** byte, the other bits are filled with copies of the sign bit,
so the value keeps its meaning. The instruction for this is `lb`, which means
load byte, sign-extended. Here is `peek`, which returns the fourth byte of a
signed byte array:

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

That is a single instruction. A byte such as `0xFB` (-5) arrives in the
register as `0xFFFFFFFB`, which is still -5 as a full-width number. The offset
does the indexing: `src[3]` on a byte array is just `3(a0)`. No shift is
needed, because bytes have a stride of 1 (each element starts 1 byte after the
previous one). Compare the word arrays of the last chapter, which had a stride
of 4.

The `s8` in the C is the reason the compiler chose `lb`. So narrow loads are
**type oracles**, like `sra`/`srl` and `div`/`divu` were: the mnemonic in the
target tells you which type to declare. If you declare the wrong type, the diff
shows one mnemonic that does not match, while everything around it matches.

The target loads a byte and does one small piece of arithmetic on it. Loaded
values work with the same idioms you have been compiling throughout this tier.

## Your task

Write `func_802de674` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802de674(s8 *p) {
    return *p * 2;
}
```
