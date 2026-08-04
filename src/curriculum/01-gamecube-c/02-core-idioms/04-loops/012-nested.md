---
id: 7cbff1f2-2f7b-546a-abb3-60b8c4ec8dd8
slug: loops-nested
title: Nested Loops
difficulty: 4
concepts:
  - nested-loops
  - multiply
  - control-flow
symbol: func_8032ffc4
hints:
  - Two stacked `for` loops; accumulate `s += i * j` in the inner body.
  - "`j` is reset to 0 at the start of each outer iteration — that's the `li r5,
    0` inside."
  - "`i * j` is a variable multiply, so it compiles to `mullw`."
---

# A loop inside a loop

A nested loop is just two skeletons stacked, where the outer loop's body *is* the
inner loop. The inner counter `j` resets to 0 at the top of every outer pass,
while the outer counter `i` waits and only moves on once the inner loop has run to
completion. Each half is the same pre-tested loop you've seen all chapter.

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

That `mullw` is there because the inner body multiplies two variable quantities,
with no constant to turn into a shift. The dead giveaway that you're looking at a
nest: the inner-counter reset, that `li r5, 0` tucked inside the outer body.

> `#pragma optimization_level 1` keeps both loops rolled.

## Your task

Write `func_8032ffc4`, returning the sum of `i * j` over all `0 <= i < n` and `0 <= j < n`.

<!-- starter -->
```c
#pragma optimization_level 1
// define func_8032ffc4 to match the target
```

<!-- solution -->
```c
#pragma optimization_level 1
int func_8032ffc4(int n) {
    int i, j, s = 0;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            s += i * j;
        }
    }
    return s;
}
```
