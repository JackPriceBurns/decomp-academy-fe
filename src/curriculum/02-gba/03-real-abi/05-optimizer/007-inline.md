---
id: b91b5ec4-4360-49d5-9d0e-64530e057d58
slug: gba-optimizer-inline
title: Helpers Expanded in Place
difficulty: 4
concepts:
  - optimizer
  - inlining
  - loops
symbol: func_083d2ee8
hints:
  - "The three instructions `cmp #255`, `ble` and `mov #255` inside the loop
    body are a helper expanded in place. If you write it as a `static inline`
    function and call it from the loop, you get exactly these instructions."
  - The function takes two parameters and returns an `s32`. The first is a
    pointer that moves forward one word at a time, and the second is the number
    of elements to visit.
---

# One listing can contain several functions

When gcc 2.9 chooses to expand a `static inline` function, that function
disappears from the object file. There is no separate copy, no symbol and no
`bl`. The body is copied into every caller, and the linker never sees the
helper.

This matters for decomp because one target listing can come from more than one
C function. Real GBA projects keep small helpers in headers so that several
translation units can share them and still match byte for byte. When you see
the same three or four instructions repeated in two places in one function,
they usually come from a shared helper.

The keyword is the only thing that controls this. A plain `inline` helper is
expanded into its callers *and* still emitted as its own symbol, so the object
file gets a function you did not want. A `static` helper without `inline` is
never expanded at `-O2`. However small it is, you get a `bl`. Both
`__attribute__((noinline))` and `__attribute__((always_inline))` are parsed and
then ignored with a warning, so neither one can fix a mismatch.

Here is `midpoint3`. It calls a two-line averaging helper on a pair of values,
and then calls it again on the result:

```asm
0        add       r0, r1
2        asr       r0, #1
4        add       r0, r2
6        asr       r0, #1
8        bx        lr
```

The four instructions are the helper's body written out twice: `add` then
`asr #1`, and again `add` then `asr #1`. Nothing marks the boundary between the
two copies. The object file has no symbol for the helper, so this listing is
the only code that was compiled.

Your target expands a helper inside a loop, so its body appears once but runs
every trip. Find the instructions that read the loaded element and produce the
value that is added to the total. In the source, those instructions are a
function of their own.

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
