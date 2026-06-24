---
id: loops-while-equivalence
title: While Is the Same Loop
difficulty: 1
concepts:
  - while-loop
  - for-loop
  - control-flow
symbol: sum
hints:
  - Initialize `i` and `s` before the loop, then `while (i < n) { s += i; i++;
    }`.
  - Keep the increment as the last statement of the body — that mirrors the
    `for`.
  - The emitted asm is identical to the `for` lesson; `for` and `while` are the
    same loop.
---

# `for` and `while` compile identically

A `for` loop is pure syntactic sugar. Once you hoist the initializer above the
loop and drop the increment at the bottom of the body, a `for` *is* a `while`.
The compiler erases the distinction completely — both produce the exact same
**pre-tested, bottom-branching** skeleton.

Here is the `squares(n)` function from the previous lesson, now written as a
`while` loop — notice the emitted assembly is byte-for-byte identical:

```asm
# squares(int n): sum 1 + 2 + ... + n
li   r4, 1          # i = 1
li   r0, 0          # s = 0
b    test           # pre-test
body:
add  r0, r0, r4     # s += i
addi r4, r4, 1      # i++
test:
cmpw r4, r3         # i <= n ?
ble+ body
mr   r3, r0
blr
```

This is worth internalizing as a decompiler: when you see this shape you cannot
tell from the asm alone whether the dev wrote `for` or `while`. A simple rule:
prefer `for` when a counter is explicit, and `while` when the condition reads
more naturally as a standalone predicate. The compiler does not care and neither
does the diff tool — the match is identical either way.

> Same as before, we keep `#pragma optimization_level 1` so the loop stays
> rolled instead of being unrolled.

## Your task

Write `sum` again, but this time express it as a `while` loop. It compiles to
the same loop skeleton as the `for` version — the test, the branch, and the body
come out identical.

<!-- starter -->
```c
#pragma optimization_level 1
int sum(int n) {
    int i = 0, s = 0;
    // turn this into a while loop
    return s;
}
```

<!-- solution -->
```c
#pragma optimization_level 1
int sum(int n) {
    int i = 0, s = 0;
    while (i < n) {
        s += i;
        i++;
    }
    return s;
}
```
