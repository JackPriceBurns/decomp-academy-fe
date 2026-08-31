---
id: 54f8ec0a-f313-529e-9a44-88649295fd32
slug: pointers-weighted-elements
title: Scaling One Element Before Combining
difficulty: 2
concepts:
  - loads
  - arrays
  - multiplication
  - chaining
symbol: func_8013e3b0
hints:
  - One loaded element is multiplied by a constant before being combined with
    another.
  - "Look for `mulli rD, rA, n` between the loads and the combine — the `n` is
    the literal multiplier."
---

# Pointer reads meet integer arithmetic

In a register, an array element is just an integer, and everything from the
arithmetic chapter still applies. Here the work is small: load an element,
multiply by a constant, add it to a neighbour. When the constant isn't a power
of two the compiler can't shift, so it uses `mulli rD, rA, n` (multiply low
immediate) and bakes the multiplier `n` into the instruction. Powers of two
still fold to `slwi`, like before.

`blend(q)` is a good example. Three elements come in, the middle one gets
scaled by 5, and the three combine:

```asm
lwz   r0, 4(r3)    # q[1]
lwz   r4, 0(r3)    # q[0]
mulli r0, r0, 5    # q[1] * 5
lwz   r3, 12(r3)   # q[3]   (displacement 12 / 4 = index 3)
add   r0, r4, r0   # q[0] + q[1]*5
subf  r3, r3, r0   # r0 - q[3]
blr
```

Loads gather the elements, `mulli` handles the scale, and the running total
flows through `add` and `subf`. To recover the C, read the assembly backward:
each displacement becomes an index, and the `mulli` immediate becomes the
multiplier. Your target has the same load-scale-combine shape with different
indices, a different multiplier, and a different final combine.

## Your task

Write `func_8013e3b0` to reproduce the assembly above.

<!-- solution -->
```c
int func_8013e3b0(int* p) {
    return p[0] * 3 + p[2];
}
```
