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
  - "Only one argument is homed and reloaded. It is reloaded twice, once for each call, and each time into the same argument position. The other argument is only ever the first call's `a0`."
  - "The first call's result is stored to `28(sp)` and also passed as the second call's first argument. The final `addu` adds the stored copy into the return value."
---

# Everything this chapter taught, in one function

Now you can put everything together. One function can use every pattern from
this chapter: a frame, homed arguments reloaded around calls, a local variable
that holds a call result, a result passed into a second call, and arithmetic
after the calls.

This is `audit(base, n)`, which computes `check(check(n, base), base) - n`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
sw     a0, 24(sp)      # home base: needed after (and inside) the calls
sw     a1, 28(sp)      # home n: needed as an argument, and at the very end
lw     a0, 28(sp)      # first call: a0 = n  (arguments swapped)
jal    check
lw     a1, 24(sp)      # and a1 = base, in the delay slot
or     a0, v0, zero    # second call: a0 = first result
jal    check
lw     a1, 24(sp)      # a1 = base again, reloaded from its home
lw     t6, 28(sp)      # n, loaded one last time
lw     ra, 20(sp)
subu   v0, v0, t6      # second result − n
jr     ra
addiu  sp, sp, 24
```

Notice how much you can now read at a glance. The two home slots at 24 and 28
show that both parameters are needed after their registers are reused. The
`lw a0, 28(sp)` / `lw a1, 24(sp)` pair shows that the first call receives them
**swapped**: slot 28 (the second parameter) goes into `a0`, and slot 24 (the
first) goes into `a1`. The `or a0, v0, zero` passes the result of the first
call to the second call. The final `subu` uses the value reloaded from slot
28, which is the original parameter and not a call result.

The target uses the same parts in a different arrangement. Watch *which*
parameter gets homed, *what* the second call receives, whether a call result
becomes a local, and what the final arithmetic combines. Read the offsets and
the patterns you know, then write the two-line body they describe.

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
