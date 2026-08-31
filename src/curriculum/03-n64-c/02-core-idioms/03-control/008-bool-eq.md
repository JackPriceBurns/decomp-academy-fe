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
  - "The `xor` of two registers is zero exactly when they match; the `sltiu 1` asks \"is it zero?\". Together they materialize `==`."
  - "One `==` expression in C produces both instructions — don't build the pieces by hand."
---

# There's no seq either

You can *branch* on equality (`beq`), but there's no instruction that hands
you `a == b` as a 1-or-0. The compiler builds it from parts, and the parts
are a fingerprint you'll see in every N64 game. First, with a constant —
`return x == 7;`:

```asm
xori  v0, a0, 0x7  # x ^ 7 — zero exactly when x is 7
sltiu v0, v0, 1    # unsigned "< 1": only zero passes
jr    ra
nop
```

Line one: XOR against the constant. XOR outputs a 1 wherever its inputs
*differ*, so the result is zero **only** when every bit matched — `x ^ 7`
is zero precisely when `x == 7`. XOR is the "difference detector".

Line two: turn "is it zero?" into a value. `sltiu v0, v0, 1` asks whether
the difference is unsigned-less-than 1 — and the only unsigned value below 1
is 0. Equal inputs → difference 0 → result 1. Any mismatch → result 0.

Why *unsigned*? Because a signed `slti 1` would also pass every negative
number. Only the unsigned reading makes "< 1" mean "== 0" — which is why the
`u` in that `sltiu` is load-bearing, and why this exact pair is so
recognizable:

> **`xor`/`xori` chased by `sltiu _, _, 1` means `==` in the C.**

For two variables the first line becomes a register `xor` — same idea, the
constant swapped for a second register. That's the target below: one `==`
between two arguments, written as ordinary C. Recognize the pair, write the
comparison, and let IDO rebuild the machinery.

## Your task

Write `func_802252a4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_802252a4(s32 a, s32 b) {
    return a == b;
}
```
