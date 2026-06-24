---
id: abi-fifth-arg
title: Reaching the Fifth Argument
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
symbol: pick5
hints:
  - The 5th argument arrives in r7.
  - "`a + e` is `add r3, r3, r7` with no setup needed."
---

# Counting up to r7

The mapping keeps going past the first few registers. The fifth integer
argument lives in **`r7`** (r3=1st, r4=2nd, r5=3rd, r6=4th, r7=5th). A function
that adds its first and fifth arguments reads exactly that:

```asm
add  r3, r3, r7   # 1st arg + 5th arg
blr
```

The compiler never moved anything into place — `a` was already in `r3` and `e`
was already in `r7`, so a single `add` does the whole job. When you see an
operation between `r3` and `r7` with nothing loaded first, it's almost always
the 1st and 5th parameters.

The pattern continues all the way through `r10`: that's the full integer
argument range, `r3`–`r10`, holding exactly eight arguments. A ninth argument
has no register left and must spill to the stack — a case you'll meet later.

## Your task

Write `pick5`, taking five `int`s, so it compiles to the `add` above.

<!-- starter -->
```c
int pick5(int a, int b, int c, int d, int e) {
    return 0;
}
```

<!-- solution -->
```c
int pick5(int a, int b, int c, int d, int e) {
    return a + e;
}
```
