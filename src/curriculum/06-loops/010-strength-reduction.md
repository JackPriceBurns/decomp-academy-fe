---
id: loops-strength-reduction
title: Strength-Reduced Induction
difficulty: 4
concepts:
  - strength-reduction
  - induction-variable
  - pointers
symbol: count
hints:
  - "`while (a[n]) n++;` — write the index access, not pointer arithmetic."
  - Because the address advances by a constant 4, MWCC keeps a pointer and uses
    `addi r3, r3, 4`.
  - The result is a plain `lwz 0(r3)` with no `slwi` and no `lwzx` — the
    multiply is strength-reduced away.
---

# The multiply that vanishes

In lesson 5 every `a[i]` cost a `slwi` (scale `i` by 4) plus an `lwzx`. But the
addresses `a[0], a[1], a[2], ...` form an arithmetic sequence — each is exactly 4
bytes past the last. The compiler exploits this with **strength reduction on the
induction variable**: instead of recomputing `a + i*4` from `i` each time, it
keeps a *pointer* and advances it by 4. The multiply disappears entirely, leaving
a plain `lwz 0(r3)` and an `addi r3, r3, 4`:

```asm
li   r4, 0          # n = 0
b    test
body:
addi r3, r3, 4      # p++  (one int = 4 bytes)
addi r4, r4, 1      # n++
test:
lwz  r0, 0(r3)      # a[n]  -> just *p, no scaling
cmpwi r0, 0         # a[n] != 0 ?
bne+ body
mr   r3, r4
blr
```

Even though the C source still *indexes* with `a[n]`, there is no `slwi` and no
`lwzx` — the address advances by a constant 4 each pass. This is one of the most
useful loop idioms to recognize: when you see a pointer marching by a fixed
stride with no per-iteration multiply, the original C was very likely an
*indexed* array access that the compiler strength-reduced.

One detail surprises people: the `addi r3, r3, 4` sits *above* the `lwz`, so it
looks like the pointer advances *before* the load. It does — but only on
repeat passes. This is the same bottom-tested shape from lesson 1: the leading
`b test` jumps **past** that `addi` on first entry, so iteration 0 loads
`a[0]` with `r3` still pointing at the array head. Only when `bne+` branches
back to `body` does the increment run, advancing to `a[1]`, `a[2]`, and so on.
Read top-to-bottom it is "advance, load, test, branch"; the first iteration just
skips the advance.

## Your task

Write `count`, returning how many elements precede the first zero in `a` (the
length of a zero-terminated `int` array). Index with `a[n]` and let the compiler
turn it into a marching pointer.

<!-- starter -->
```c
int count(int *a) {
    int n = 0;
    // advance n until a[n] == 0
    return n;
}
```

<!-- solution -->
```c
int count(int *a) {
    int n = 0;
    while (a[n]) n++;
    return n;
}
```
