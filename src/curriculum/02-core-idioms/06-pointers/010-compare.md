---
id: pointers-compare
title: Comparing Two Pointers
difficulty: 4
concepts:
  - pointers
  - comparison
  - boolean
symbol: same
hints:
  - Pointer equality is address equality — write the plain `a == b`.
  - The branchless form is `subf`, `cntlzw`, then `srwi r3, r0, 5`.
---

# Equality without a branch

Two pointers are equal when their addresses are the same integer. MWCC avoids
a branch for this by using a three-instruction idiom: subtract the two addresses,
count the leading zero bits of the result, then shift right.

The key instruction is `cntlzw rD, rA` — *count leading zeros word*. It counts
how many of the 32 bits, starting from the most significant, are zero. That count
is 32 only when the input is exactly zero; for any non-zero input it is at most
31.

Here is the same idiom applied to `u8*` pointers with different operand names:

```c
BOOL at_same_byte(u8* p, u8* q) {
    return p == q;
}
```

```asm
subf    r0,r3,r4    # r4 - r3 (zero iff addresses equal)
cntlzw  r0,r0       # 32 iff zero, ≤ 31 otherwise
srwi    r3,r0,5     # 32 >> 5 = 1 (true); anything else >> 5 = 0 (false)
blr
```

`subf rD,rA,rB` computes `rB − rA` (note: *not* `rA − rB`). After the
subtract, a zero result means the inputs were equal. `cntlzw` turns that zero
into 32, and shifting right by 5 maps 32 → 1 while collapsing all smaller counts
to 0. Recognize this three-instruction sequence as a branchless `==`.

## Your task

Write `same`, taking two `int*` and returning whether they point at the same
address.

<!-- starter -->
```c
BOOL same(int* a, int* b) {
    return FALSE;
}
```

<!-- solution -->
```c
BOOL same(int* a, int* b) {
    return a == b;
}
```
