---
id: loops-weighted-sum
title: A Loop With More Work Inside
difficulty: 3
concepts:
  - arrays
  - induction-variable
  - involved-body
symbol: wsum
hints:
  - The body both reads `a[i]` and uses `i` itself in the arithmetic — keep the
    index around as a value, not just a loop counter.
  - "`mullw` appears because two *variable* quantities are multiplied; neither is a
    constant the compiler could turn into a shift."
  - The accumulator is still a plain running `add`; only the value being added is
    more involved than before.
---

# When the body does more than one thing

Every loop so far added a single, simple thing per pass. The skeleton never
changes when the body grows — the same `pre_loop` / `body` / `test` shape just
holds *more* instructions between the label and the increment. The art is reading
a longer body as one expression instead of a pile of unrelated instructions.

Here the induction variable does double duty: it indexes the array **and** feeds
the arithmetic. Consider `sqsum(a, n)`, which adds each element multiplied by
itself — a sum of squares:

```asm
li   r7, 0          # s = 0
li   r6, 0          # i = 0
b    test
body:
slwi r5, r6, 2      # i * 4
slwi r0, r6, 2      # i * 4 (again, for the second use)
lwzx r5, r3, r5     # load a[i]
addi r6, r6, 1      # i++
lwzx r0, r3, r0     # load a[i] (again)
mullw r0, r5, r0    # a[i] * a[i]
add  r7, r7, r0     # s += that product
test:
cmpw r6, r4         # i < n ?
blt+ body
mr   r3, r7
blr
```

The `slwi`+`lwzx` pair you already know loads `a[i]`; the new piece is the
`mullw` combining two *variable* operands. A `mullw` (rather than a `slwi`) is the
tell that **both** factors are runtime values — there is no constant to
strength-reduce into a shift. Read what flows into the `mullw`, then what flows
into the final `add`, and the body collapses into one accumulation expression.

Your `wsum` has a similar shape but the two factors going into the `mullw` are
*different* — one is the loaded element, the other is built from the loop counter
itself. Trace which value each operand of the `mullw` came from to recover the
weight.

> `#pragma optimization_level 1` keeps the loop rolled so the body is readable.

## Your task

Write `wsum`: over `0 <= i < n`, weight each element by its 1-based position
before adding it into the running total. Reproduce the assembly above.

<!-- starter -->
```c
#pragma optimization_level 1
int wsum(int *a, int n) {
    int i, s = 0;
    // weight each element by its 1-based position
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
int wsum(int *a, int n) {
    int i, s = 0;
    for (i = 0; i < n; i++) {
        s += a[i] * (i + 1);
    }
    return s;
}
```
