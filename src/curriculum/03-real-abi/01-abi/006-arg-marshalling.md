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
slots the callee will read. This is **argument marshalling**. Consider
`pass_on(s32 x) { return merge(x, x - 2); }`, which passes `x` as the first
argument and a derived value as the second:

```asm
stwu   r1,-16(r1)
mflr   r0
addi   r4,r3,-2    # build 2nd argument in r4 before the call
stw    r0,20(r1)
bl     merge       # merge(x, x - 2)
lwz    r0,20(r1)
mtlr   r0
addi   r1,r1,16
blr
```

Crucially, `x` arrived in `r3` and the *first* argument also goes in `r3`, so it
needs no move — the compiler computes the second argument into `r4` and leaves
`r3` alone. The result of `merge` comes back in `r3`, which is already where
our own return value belongs, so the epilogue can return it directly.

Now look at the target assembly for `forward`. The first argument passes through
in `r3`, and the instruction before the `bl` loads `r4`. Work out what
relationship between `x` and the second argument that `addi` encodes.

## Your task

Write `forward`, which calls `combine` with the arguments marshalled as shown in
the target assembly. `combine` is declared for you.

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
