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
  - Two `lsl`s with no matching second shift mean a comparison of two narrow
    values of the same width. The count gives the width, and the branch mnemonic
    gives the signedness. The third register is never shifted, so it is already
    wide.
  - There are two `s16` parameters and one `s32` parameter, and the function
    returns an `s32`. A comparison of the two narrow parameters decides which
    way the `s32` is adjusted by one.
---

# Comparing in the top of the register

Extending a narrow value takes two shifts, so comparing two narrow values would
take four. gcc 2.9 uses only two. If both operands have the same width, it
shifts each one left so the value sits at the top of its register, and compares
them there. It skips the second shift of each extension, because shifting both
sides left by the same amount keeps their order the same.

Here are two comparisons, each of them `a < b`:

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

The first compares two `u16`s and the second compares two `s8`s. An `lsl` with
no `asr` or `lsr` after it is an unpaired shift, and it marks this pattern. The
shift count is still 32 minus the width. The signedness now shows up in a
different place: the branch mnemonic. `bhs`, `blo`, `bhi` and `bls` test the
unsigned flags, so they mean the operands were unsigned. `bge`, `blt`, `bgt`
and `ble` mean the operands were signed.

Also look at the instruction order, because it affects the match. The unsigned
form puts `mov r2, #0` after both shifts, and the signed form puts it first. The
instructions are the same but the order differs, and only one of the two orders
will match.

Your target has two of these unpaired shifts and a branch. The register that
gets adjusted afterwards is never shifted at all.

## Your task

Write `func_081e359c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_081e359c(s16 a, s16 b, s32 x) {
    if (a < b) return x + 1;
    return x - 1;
}
```
