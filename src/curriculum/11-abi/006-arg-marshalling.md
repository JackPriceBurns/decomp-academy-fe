---
id: abi-arg-marshalling
title: Marshalling Arguments for a Call
difficulty: 2
concepts:
  - calling-convention
  - calls
  - arguments
symbol: forward
hints:
  - The two call arguments must land in r3 and r4 before the `bl`.
  - "`x` is already in r3; the compiler builds `x + 1` into r4 with `addi r4,
    r3, 1`."
---

# Filling r3, r4, … before you branch

To call a function you must place its arguments into the same `r3`, `r4`, `r5`…
slots the callee will read. This is **argument marshalling**. When you call
`combine(x, x + 1)`, the compiler must get `x` into `r3` and `x + 1` into `r4`
before the `bl`:

```asm
stwu r1, -16(r1)
mflr r0
addi r4, r3, 1     # r4 = x + 1  (the 2nd argument)
stw  r0, 20(r1)    # save our return address (no move needed for r3 — see below)
bl   combine       # combine(x, x + 1)
... epilogue ...
blr
```

Crucially, `x` arrived in `r3` and the *first* argument also goes in `r3`, so it
needs no move — the compiler computes the second argument into `r4` and leaves
`r3` alone. The result of `combine` comes back in `r3`, which is already where
our own return value belongs, so the epilogue can return it directly.

## Your task

Write `forward`, which calls `combine` with the arguments marshalled as shown above. `combine` is declared for
you.

<!-- starter -->
```c
int forward(int x) {
    return 0;
}
```

<!-- solution -->
```c
int forward(int x) {
    return combine(x, x + 1);
}
```

<!-- context -->
```c
extern int combine(int a, int b);
```
