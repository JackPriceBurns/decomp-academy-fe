---
id: d088672b-6741-44bf-bd53-469083410de0
slug: gba-types-narrow-compare
title: Comparing Narrow Values
difficulty: 4
concepts:
  - narrow-types
  - comparisons
  - branches
symbol: func_081e359c
hints:
  - Two `lsl`s with no matching second shift is a comparison of two same-width
    narrow values; the count gives the width and the branch mnemonic gives the
    signedness. The third register is never shifted, so it is already wide.
  - "Two `s16` parameters and an `s32`, returning an `s32` - a comparison of the
    two narrow ones picks which way the `s32` is adjusted by one."
---

# Comparing in the top of the register

Extending a narrow value takes two shifts, and a comparison of two of them
would take four. gcc 2.9 charges you two. If both operands are the same width,
it shifts each one up so the value sits at the top of its register and compares
them there - the second half of each extension is skipped, because shifting both
sides left by the same amount preserves the ordering.

Here are two comparisons, each one `a < b`:

```asm
0        lsl       r0, #16
2        lsl       r1, #16
4        mov       r2, #0
6        cmp       r0, r1
8        bhs       12 ~>
10       mov       r2, #1
12     ~>mov       r0, r2
14       bx        lr
```

```asm
0        mov       r2, #0
2        lsl       r0, #24
4        lsl       r1, #24
6        cmp       r0, r1
8        bge       12 ~>
10       mov       r2, #1
12     ~>mov       r0, r2
14       bx        lr
```

The first compares two `u16`s, the second two `s8`s. A lone `lsl` with no `asr`
or `lsr` following it is the fingerprint of this trick, and the shift count is
still 32 minus the width. Signedness has gone somewhere new: it is in the branch
mnemonic. `bhs`, `blo`, `bhi` and `bls` test the unsigned flags and mean the
operands were unsigned; `bge`, `blt`, `bgt` and `ble` mean they were signed.

Watch the scheduling too, because it is part of the match. The unsigned form
emits `mov r2, #0` after both shifts and the signed form emits it first. Same
instructions, different order, and only one of the two orders will match.

Your target has two of those lone shifts and a branch, and the register that
gets adjusted afterwards was never shifted at all.

## Your task

Write `func_081e359c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081e359c(s16 a, s16 b, s32 x) {
    if (a < b) return x + 1;
    return x - 1;
}
```
