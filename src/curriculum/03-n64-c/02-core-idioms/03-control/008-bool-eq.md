---
id: 6894a930-9496-4ce5-b5ee-8358188866a4
slug: control-bool-eq
title: Equality as a Value
difficulty: 3
concepts:
  - booleans
  - compare
  - fingerprints
symbol: func_802252a4
hints:
  - "The `xor` of two registers is zero exactly when they match; the `sltiu 1` asks \"is it zero?\". Together they compute `==` as a value."
  - "One `==` expression in C produces both instructions. Don't build the pieces by hand."
---

# There is no seq either

You can *branch* on equality with `beq`, but no instruction gives you `a == b`
as a 1 or 0. The compiler builds it from two instructions, and that pair is a
pattern you will see in every N64 game. First, with a constant,
`return x == 7;`:

```asm
xori  v0, a0, 0x7  # x ^ 7, zero exactly when x is 7
sltiu v0, v0, 1    # unsigned "< 1": only zero passes
jr    ra
nop
```

Line one: XOR with the constant. XOR outputs a 1 in every bit where its inputs
*differ*, so the result is zero **only** when every bit matched. `x ^ 7` is
zero exactly when `x == 7`. You can think of XOR as a "difference detector".

Line two: turn "is it zero?" into a value. `sltiu v0, v0, 1` asks whether the
difference is less than 1 when read as unsigned. The only unsigned value below
1 is 0. Equal inputs give a difference of 0, so the result is 1. Any mismatch
gives a result of 0.

The comparison must be *unsigned*, because a signed `slti 1` would also pass
every negative number. Only the unsigned reading makes "< 1" mean "== 0". That
is why the `u` in that `sltiu` matters, and why this exact pair is so
recognizable:

> **`xor`/`xori` followed by `sltiu _, _, 1` means `==` in the C.**

For two variables, the first line becomes a register `xor`. The idea is the
same, with a second register in place of the constant. The target below uses
this register form. Recognize the pair, write the comparison as ordinary C,
and let IDO rebuild the instructions.

## Your task

Write `func_802252a4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802252a4(s32 a, s32 b) {
    return a == b;
}
```
