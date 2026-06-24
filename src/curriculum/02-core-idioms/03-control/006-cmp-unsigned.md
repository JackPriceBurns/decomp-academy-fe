---
id: control-cmp-unsigned
title: "Unsigned Compare: cmplw"
difficulty: 3
concepts:
  - comparison
  - unsigned
  - branch
  - types
symbol: pick_unsigned
hints:
  - Unsigned operands feeding a branch use `cmplw`, not `cmpw`.
  - The only difference from the signed version is the operand types.
---

# Same code, unsigned types, different instruction

Take the same `if`/`else` shape from the previous lesson and change the operand
types to `u32`. The structure is identical — but the compare becomes
**`cmplw`**, the *logical* (unsigned) word compare:

```asm
cmplw r3, r4      # unsigned word compare
li    r3, 200     # speculative load
bgelr-            # conditional return
li    r3, 100     # fall-through value
blr
```

The only difference from the signed version is the mnemonic in the first line —
`cmplw` instead of `cmpw`. Everything else stays the same.

Why it matters: under unsigned ordering `0xFFFFFFFF` is the *largest* value, not
`-1`. Pick the wrong compare and a value like `0xFFFFFFFF` lands on the wrong
side of the branch. **The types in your C are what select `cmpw` vs `cmplw`** —
if your match shows `cmplw` but you wrote `int`, the original local or field was
unsigned. Spotting this mismatch is one of the most useful debugging skills in
decompilation: it points straight back to the original type.

The compare mnemonic tells you the operand type; the branch mnemonic and the
two `li` values tell you the condition and which constant is returned in each
case.

## Your task

Write `pick_unsigned`, taking two `u32`s, to reproduce the assembly above.

<!-- starter -->
```c
int pick_unsigned(u32 a, u32 b) {
    return 0;
}
```

<!-- solution -->
```c
int pick_unsigned(u32 a, u32 b) {
    if (a < b) return 100;
    return 200;
}
```
