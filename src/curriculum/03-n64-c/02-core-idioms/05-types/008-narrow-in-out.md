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
  - "There are two homing stores, two masks on the incoming arguments, one bitwise operation and one mask on the result. Every `andi` has the same width, so all three declarations agree."
  - "The body is a single `&` of the two parameters. If the signature has the right types, the whole listing matches."
---

# The return side of the ritual

One more piece completes the picture for narrow arguments: what happens when
the *return type* is also narrow. Here is `bump`, a `u8 → u8` increment:

```c
u8 bump(u8 c) {
    return c + 1;
}
```

```asm
sw    a0, 0(sp)     # homing store: narrow arg, as always
andi  t6, a0, 0xff  # re-extend the incoming u8
or    a0, t6, zero
addiu v0, a0, 1     # the actual work: c + 1
andi  t7, v0, 0xff  # truncate the RESULT back to u8
or    v0, t7, zero
jr    ra
nop
```

Read it in three parts:

1. **Arrival**: the homing store plus `andi 0xff`. This cleans up the incoming
   argument, as you saw in the last lesson.
2. **Work**: `addiu v0, a0, 1`. This is the one line that comes from your C.
   If `c` was `255`, the sum is briefly the full 32-bit value `256`. Width
   rules apply only at the *edges*. Inside the arithmetic, values keep their
   full width.
3. **Departure**: `andi 0xff` again, this time on the result. A narrow return
   type promises the caller a clean value, so the function truncates the
   result before it returns. This is the same cast idiom, but here the
   signature causes it instead of an explicit cast.

So a `u8`-returning function shows its return type in its final mask. An
`s8`/`s16` return would end with the shift pair instead. Between arrival and
departure, expect small `or …, zero` copies that move values between
registers. IDO leaves more of these in narrow code than anywhere else. They
are noise, so count only the real operations.

The target's arrival has narrow arguments, its work is one bitwise operation,
and its departure truncates again. Every mask in the listing agrees about the
width. Declare every position (the parameters and the return type) to match.

## Your task

Write `func_8013fa1c` to reproduce the target assembly, with every type in the
signature set the way the target requires.

<!-- solution -->
```c
u8 func_8013fa1c(u8 v, u8 m) {
    return v & m;
}
```
