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
  - Arguments map to r3, r4, r5, r6 in order — read the `mr`'s source register
    and count to find its position.
  - A single `mr r3, rN` copies the Nth argument into the return register; no
    other work is needed.
---

# Where the arguments live

The GameCube ABI hands the first eight integer (or pointer) arguments to a
function in registers **`r3`, `r4`, `r5`, `r6`, `r7`, `r8`, `r9`, `r10`** — in
that order. The first argument is in `r3`, the second in `r4`, and so on.

Consider a function `third(int a, int b, int c, int d)` that returns its third
argument. Three out of four parameters are unused, so the only instruction is a
single `mr` to copy the right register into the return register:

```asm
mr   r3, r5      # r3 = the 3rd argument
blr
```

`mr` ("move register") copies one GPR to another. The three unused arguments
arrive in registers but generate no code. Knowing the argument-to-register
mapping by heart lets you read any function signature straight off its first few
instructions.

Now look at the assembly for `fourth`. The `mr` copies a different source
register — figure out which argument position that register corresponds to and
return it.

## Your task

Write `fourth`, taking four `int`s and returning the one whose register matches
the assembly above.

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
