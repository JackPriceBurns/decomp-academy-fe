---
id: 8a3abd56-8491-5a95-bfaa-667f94b74d04
slug: abi-arg-marshalling
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

A `bl` reads its arguments straight out of registers, so before you branch
they had better be in the right ones. `r3` holds the first, `r4` the second,
`r5` the third. Setting that up is **argument marshalling**. Here is
`pass_on(s32 x) { return merge(x, x - 2); }`, forwarding `x` first and a value
derived from it second:

```asm
stwu   r1,-16(r1)
mflr   r0
subi   r4,r3,2     # build 2nd argument in r4 before the call
stw    r0,20(r1)
bl     merge       # merge(x, x - 2)
lwz    r0,20(r1)
mtlr   r0
addi   r1,r1,16
blr
```

`x` already sat in `r3`, and that is where the first argument belongs, so the
compiler never touches it. It only has to build the second argument in `r4`.
`merge` returns into `r3` as well, the same register our own return value uses,
so the epilogue just falls through and returns it.

The target assembly for `forward` works the same way. `r3` carries the first
argument untouched, and the lone instruction ahead of the `bl` sets up `r4`.
Read that `addi` and decide how the second argument relates to `x`.

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
