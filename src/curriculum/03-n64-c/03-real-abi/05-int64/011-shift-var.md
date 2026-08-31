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
  - "The helper name carries both direction and signedness — `u` in the name, `u` in your types."
  - "The `s32` count still homes and reloads; the delay-slot `sra` is just its widening, not part of your C."
---

# The count comes from a register

Same helpers, one new wrinkle: when the shift count is a *variable*, it's
usually an `s32` — and the helper wants a 64-bit pair. So the widening
recipe from earlier in this chapter shows up in the call setup. Here's
`varUp(x, n)`, which shifts an `s64` left by `s32 n`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)      # x homes…
sw     a1, 28(sp)
sw     a2, 32(sp)      # …and so does n — everything homes around a call
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

Read the call setup as a little relocation puzzle. `n` arrived in `a2`, but
that's where the *count pair's high word* must go — so `n` homes at 32,
reloads into `a3` (the pair's low word), and the lone `sra`-by-31 builds
its sign into `a2`. And where does the compiler schedule that `sra`? In the
`jal`'s delay slot, naturally — the last argument assembled one instruction
*after* the call, a trick you've watched since the ABI chapter.

So a variable-count shift reads: homes for everything, reloads that
shuffle the count down one register, a `jal` to one of the three shift
helpers, and a widening `sra` riding the slot. The C behind all of it is
still `x << n` — or its two right-shifting siblings.

In the target, mind the helper's name: it decides both the operator *and*
what type `x` must be.

## Your task

Write `func_8010d090` to reproduce the target assembly.

<!-- solution -->
```c
u64 func_8010d090(u64 x, s32 n) {
    return x >> n;
}
```
