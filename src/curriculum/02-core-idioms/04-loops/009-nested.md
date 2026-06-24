---
id: loops-nested
title: Nested Loops
difficulty: 4
concepts:
  - nested-loops
  - multiply
  - control-flow
symbol: grid
hints:
  - Two stacked `for` loops; accumulate `s += i * j` in the inner body.
  - "`j` is reset to 0 at the start of each outer iteration — that's the `li r5,
    0` inside."
  - "`i * j` is a variable multiply, so it compiles to `mullw`."
---

# A loop inside a loop

Nesting just stacks two skeletons: the outer loop's body *is* the inner loop. The
inner counter `j` is re-initialized to 0 at the top of every outer pass, and the
outer counter `i` only advances after the inner loop completes. Each shape is the
same pre-tested loop you already know:

```asm
li   r6, 0          # accumulator = 0
li   r4, 0          # outer index = 0
b    otest
obody:
li   r5, 0          # inner index = 0 (reset each outer pass)
b    itest
ibody:
mullw r0, r4, r5    # variable product
addi r5, r5, 1      # advance inner index
add  r6, r6, r0     # accumulate
itest:
cmpw r5, r3         # inner bound test
blt+ ibody
addi r4, r4, 1      # advance outer index
otest:
cmpw r4, r3         # outer bound test
blt+ obody
mr   r3, r6
blr
```

The `mullw` appears because the inner body computes a *variable* product (no
constant to shift by). The giveaway for nesting is that inner-counter reset
(`li r5, 0`) sitting inside the outer body.

> `#pragma optimization_level 1` keeps both loops rolled.

## Your task

Write `grid`, returning the sum of `i * j` over all `0 <= i < n` and `0 <= j < n`.

<!-- starter -->
```c
#pragma optimization_level 1
int grid(int n) {
    int i, j, s = 0;
    // sum i*j over the n-by-n grid
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
int grid(int n) {
    int i, j, s = 0;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            s += i * j;
        }
    }
    return s;
}
```
