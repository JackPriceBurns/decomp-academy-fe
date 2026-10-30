---
id: 8434241a-70ee-407b-a369-487c5b26128d
slug: int64-shift-var
title: Shifting by a Variable
difficulty: 3
concepts:
  - int64
  - shifts
  - millicode
  - sign-extension
symbol: func_8010d090
hints:
  - "The helper name gives both the direction and the signedness. A `u` in the name means a `u` in your types."
  - "The `s32` count is still homed and reloaded. The `sra` in the delay slot only widens it and is not part of your C."
---

# The count comes from a register

These are the same helpers, with one new detail. When the shift count is a
*variable*, it is usually an `s32`, but the helper expects a 64-bit pair. So
the widening pattern from earlier in this chapter appears in the call setup.
Here is `varUp(x, n)`, which shifts an `s64` left by `s32 n`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)      # x homes…
sw     a1, 28(sp)
sw     a2, 32(sp)      # …and so does n, since everything homes around a call
lw     a3, 32(sp)      # n reloads as the count's LOW word
lw     a0, 24(sp)      # x reloads in place
lw     a1, 28(sp)
jal    __ll_lshift
sra    a2, a3, 31      # (slot) count's high word: n's sign, made in the slot
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

Read the call setup as a small problem of moving values between registers.
`n` arrived in `a2`, but that is where the *count pair's high word* must go.
So `n` is homed at 32 and reloaded into `a3` (the pair's low word), and the
lone `sra` by 31 builds its sign in `a2`. The compiler schedules that `sra` in
the `jal`'s delay slot. The last argument is built one instruction *after*
the call in the listing, a pattern you have seen since the ABI chapter.

So a shift by a variable count looks like this: home slots for everything,
reloads that move the count down one register, a `jal` to one of the three
shift helpers, and a widening `sra` in the delay slot. The C behind all of it
is still `x << n`, or one of the two right shifts.

In the target, pay attention to the helper's name. It decides both the
operator *and* the type `x` must have.

## Your task

Write `func_8010d090` to reproduce the target assembly.

<!-- solution -->
```c
u64 func_8010d090(u64 x, s32 n) {
    return x >> n;
}
```
