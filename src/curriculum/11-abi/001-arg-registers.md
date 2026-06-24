---
id: abi-arg-registers
title: The Integer Argument Registers
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
symbol: fourth
hints:
  - Arguments map to r3, r4, r5, r6 in order — the 4th is in r6.
  - "`return d;` copies r6 into r3: `mr r3, r6`."
---

# Where the arguments live

The GameCube ABI hands the first eight integer (or pointer) arguments to a
function in registers **`r3`, `r4`, `r5`, `r6`, `r7`, `r8`, `r9`, `r10`** — in
that order. The first argument is in `r3`, the second in `r4`, and so on.

A function that simply returns its **fourth** argument therefore just copies
`r6` into the return register `r3`:

```asm
mr   r3, r6      # r3 = the 4th argument
blr
```

`mr` ("move register") is `r3 = r6`. The other three arguments arrive in
`r3`–`r5` but go unused, so they generate no code at all. Knowing the
argument-to-register mapping by heart lets you read any function signature
straight off its first few instructions.

## Your task

Write `fourth`, taking four `int`s and returning the **fourth** one (`d`).

<!-- starter -->
```c
int fourth(int a, int b, int c, int d) {
    return 0;
}
```

<!-- solution -->
```c
int fourth(int a, int b, int c, int d) {
    return d;
}
```
