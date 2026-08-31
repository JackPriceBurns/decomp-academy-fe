---
id: b840cce8-f77e-4b08-a20a-2d0adec4436a
slug: abi-capstone
title: "Capstone: The Calling Convention, End to End"
difficulty: 4
concepts:
  - abi
  - calls
  - homing
  - frames
  - capstone
symbol: func_80210330
hints:
  - "Only one argument is homed and reloaded — twice, once per call, each time into the same argument position. The other argument is only ever the first call's `a0`."
  - "The first call's result is both stored to `28(sp)` and forwarded as the second call's first argument; the final `addu` folds the stored copy into the return value."
---

# Everything this chapter taught, in one function

Time to put the whole kit together. One function, every idiom: a frame, homed
arguments reloaded around calls, a local born from a call result, forwarding
into a second call, and arithmetic on the far side.

Here's `audit(base, n)`, which computes `check(check(n, base), base) - n`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)      # home base — needed after (and inside) the calls
sw     a1, 28(sp)      # home n — needed as an argument, and at the very end
lw     a0, 28(sp)      # first call: a0 = n  (arguments swapped!)
jal    check
lw     a1, 24(sp)      # …and a1 = base, in the delay slot
or     a0, v0, zero    # second call: a0 = first result
jal    check
lw     a1, 24(sp)      # a1 = base again, reloaded from its home
lw     t6, 28(sp)      # n, one last time
lw     ra, 20(sp)
subu   v0, v0, t6      # second result − n
jr     ra
addiu  sp, sp, 24
```

Notice how much you can now *reject* on sight. The two homes at 24/28 say both
parameters outlive their registers. The `lw a0, 28(sp)` / `lw a1, 24(sp)` pair
says the first call receives them **crossed** — slot 28 (the second parameter)
feeds `a0`, slot 24 (the first) feeds `a1`. The `or a0, v0, zero` chains call
one into call two. And the closing `subu` reaches back to slot 28 for the raw
parameter, not any call result.

The target is built from the same parts in a different arrangement: watch
*which* parameter gets homed, *what* the second call receives, whether a call
result becomes a local, and what the final arithmetic combines. Read the
offsets, trust the idioms, and write the two-line body they describe.

## Your task

`extern s32 rate(s32 x, s32 y);` is declared for you. Write `func_80210330` to
reproduce the target assembly.

<!-- solution -->
```c
s32 func_80210330(s32 id, s32 kind) {
    s32 score = rate(id, kind);

    return rate(score, kind) + score;
}
```

<!-- context -->
```c
extern s32 rate(s32 x, s32 y);
```
