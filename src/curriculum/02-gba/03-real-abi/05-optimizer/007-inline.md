---
id: b91b5ec4-4360-49d5-9d0e-64530e057d58
slug: gba-optimizer-inline
title: Helpers That Leave No Trace
difficulty: 4
concepts:
  - optimizer
  - inlining
  - loops
symbol: func_083d2ee8
hints:
  - "The `cmp #255` / `ble` / `mov #255` trio inside the loop body is a
    helper expanded in place. Writing it as a `static inline` function and
    calling it from the loop produces exactly these instructions."
  - Two parameters in, an `s32` out - a pointer walked forwards one word at a
    time, and the number of elements to visit.
---

# One listing, several functions

A `static inline` function that gcc 2.9 chooses to expand disappears from the
object file entirely. There is no out-of-line copy, no symbol, no `bl` — the
body is spliced into every caller and the helper stops existing as far as the
linker is concerned.

That matters for decomp because a target listing does not have to correspond
to one function of C. Real GBA projects keep small helpers in headers exactly
so that several translation units can share them and still match byte for byte,
and when you meet the same three or four instructions repeated at two places in
one function, a shared helper is usually what wrote them.

The keyword is the whole lever. A plain `inline` helper is expanded into its
callers *and* still emitted as its own symbol, so the object gains a function
you did not want. A `static` helper without `inline` is never expanded at all
at `-O2` — however small it is, you get a `bl`. And both
`__attribute__((noinline))` and `__attribute__((always_inline))` are parsed and
then discarded with a warning, so neither can rescue a mismatch.

Here is `midpoint3`, which calls a two-line averaging helper on a pair and then
on the result:

```asm
0        add       r0, r1
2        asr       r0, #1
4        add       r0, r2
6        asr       r0, #1
8        bx        lr
```

Four instructions, and they are the helper's body written out twice: `add` then
`asr #1`, `add` then `asr #1`. Nothing marks the boundary between the two
expansions, and the object contains no symbol for the helper — the listing you
are looking at is the only thing that got compiled.

Your target expands a helper inside a loop, so its body appears once but runs
every trip. Find the run of instructions that reads the loaded element and
produces the value that gets accumulated: that run is a function of its own in
the source.

## Your task

Write `func_083d2ee8` to reproduce the target assembly.

<!-- solution -->
```c
static inline s32 clamp255(s32 v) { return v > 255 ? 255 : v; }

s32 func_083d2ee8(s32 *p, s32 n) {
    s32 sum = 0;
    s32 i;
    for (i = 0; i < n; i++) sum += clamp255(p[i]);
    return sum;
}
```
