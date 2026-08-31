---
id: b4fe8787-8125-4039-a89e-df8ce759ca75
slug: types-narrow-in-out
title: "Narrow In, Narrow Out"
difficulty: 3
concepts:
  - types
  - arg-homing
  - casts
symbol: func_8013fa1c
hints:
  - "Two homing stores, two incoming masks, one bitwise op, one outgoing mask. Every `andi` has the same width — all three declarations agree."
  - "The body is a single `&` of the two parameters. Type the signature right and the whole listing appears."
---

# The return leg of the ritual

One more piece completes the narrow-argument picture: what happens when
the *return type* is narrow too. Here's `bump`, a `u8 → u8` increment:

```c
u8 bump(u8 c) {
    return c + 1;
}
```

```asm
sw    a0, 0(sp)     # homing store — narrow arg, as always
andi  t6, a0, 0xff  # re-extend the incoming u8
or    a0, t6, zero
addiu v0, a0, 1     # the actual work: c + 1
andi  t7, v0, 0xff  # truncate the RESULT back to u8
or    v0, t7, zero
jr    ra
nop
```

Read it as three acts:

1. **Arrival**: homing store plus `andi 0xff` — the incoming cleanup you
   know from last lesson.
2. **Work**: `addiu v0, a0, 1`. The one line that's yours. Note the sum
   momentarily lives as a full 32-bit `256` if `c` was `255` — width rules
   apply at the *edges*, not inside the arithmetic.
3. **Departure**: `andi 0xff` again, on the result. A narrow return type
   promises the caller a clean value, so the function truncates on the
   way out — the same cast idiom, triggered by the signature instead of
   an explicit cast.

So a `u8`-returning function shows its return type in its final mask
(and an `s8`/`s16` return would sign off with the shift pair instead).
Between arrival and departure, expect little `or …, zero` copies
shuffling values — IDO leaves more of them lying around in narrow code
than anywhere else. They're noise; count the real ops.

The target's arrival has narrow arguments, its work is one bitwise op,
and its departure truncates again — every mask in the listing agrees
about the width. Declare every position (params and return) to match.

## Your task

Write `func_8013fa1c`, typing the whole signature as the target demands, to
reproduce the target assembly.

<!-- solution -->
```c
u8 func_8013fa1c(u8 v, u8 m) {
    return v & m;
}
```
