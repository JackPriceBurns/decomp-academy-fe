---
id: 27b8f4fa-049f-50a8-b4cf-bbb272d517f3
slug: abi-fifth-arg
title: Reaching the Fifth Argument
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
symbol: func_801ee3d0
hints:
  - The 5th argument arrives in r7; r3 holds the 1st.
  - The `add` reads two argument registers directly — map each to its parameter,
    no setup needed.
---

# Counting up to r7

The mapping keeps going past the first few registers. Integer argument registers
are `r3`–`r10`: r3 holds the 1st, r4 the 2nd, r5 the 3rd, r6 the 4th, and r7 the
5th. When you need an arithmetic operation between the 2nd and 5th arguments, the
compiler can reach straight for `r4` and `r7` with no setup:

```asm
mullw  r3,r4,r7
blr
```

That's `second_plus_fifth(s32 a, s32 b, s32 c, s32 d, s32 e) { return b * e; }` —
the compiler multiplies `r4` (`b`) by `r7` (`e`) and leaves the result in `r3`.
Nothing moves; both inputs are already in their argument registers.

The pattern continues through `r10`, the full integer argument range, holding
exactly eight arguments. A ninth argument has no register left and must spill to
the stack — a case you'll meet later.

Now look at `func_801ee3d0`. Its target assembly uses `add` between two argument
registers — identify which two, then map them to the corresponding parameters.

## Your task

Write `func_801ee3d0` to match the target assembly.

<!-- solution -->
```c
int func_801ee3d0(int a, int b, int c, int d, int e) {
    return a + e;
}
```
