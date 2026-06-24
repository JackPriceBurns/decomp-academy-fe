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

Take the *exact same* `if (a < b)` logic from the previous lesson and change the
operands to `u32`. The structure is identical — but the compare becomes
**`cmplw`**, the *logical* (unsigned) word compare:

```asm
cmplw r3, r4      # UNSIGNED compare
li    r3, 200
bgelr-
li    r3, 100
blr
```

Why it matters: under unsigned ordering `0xFFFFFFFF` is the *largest* value, not
`-1`. Pick the wrong compare and a value like `0xFFFFFFFF` lands on the wrong
side of the branch. **The types in your C are what select `cmpw` vs `cmplw`** —
if your match shows `cmplw` but you wrote `int`, the original local or field was
unsigned. Spotting this mismatch — `cmplw` where you expected `cmpw` — is one of
the most useful debugging skills in decompilation: it points straight back to the
original type.

## Your task

Write `pick_unsigned` taking two `u32`s: return `100` if `a < b`, otherwise
`200`.

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
