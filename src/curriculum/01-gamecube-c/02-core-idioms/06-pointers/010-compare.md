---
id: 3155a7cd-5593-5b08-a1d9-a1078d73110c
slug: pointers-compare
title: Comparing Two Pointers
difficulty: 4
concepts:
  - pointers
  - comparison
  - boolean
symbol: func_8005569c
hints:
  - Pointer equality is address equality — write the plain `a == b`.
  - The branchless form is `subf`, `cntlzw`, then `srwi r3, r0, 5`.
---

# Equality without a branch

Two pointers are equal when their addresses are the same integer. MWCC avoids a
branch with a three-instruction idiom: subtract the addresses, count leading
zeros of the result, then shift right.

The key instruction is `cntlzw rD, rA` — count leading zeros word. It counts
how many of the 32 bits, starting from the top, are zero. That count is 32 only
when the input is exactly zero; for anything non-zero it's at most 31.

Here's the idiom applied to `u8*` pointers:

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

`subf rD,rA,rB` computes `rB − rA` (not `rA − rB`). After the subtract, a zero
result means the inputs were equal. `cntlzw` turns that zero into 32, and
shifting right by 5 maps 32 → 1 while collapsing smaller counts to 0. Recognize
this three-instruction sequence as a branchless `==`.

## Your task

Write `func_8005569c` to reproduce the target assembly.

<!-- solution -->
```c
BOOL func_8005569c(int* a, int* b) {
    return a == b;
}
```
