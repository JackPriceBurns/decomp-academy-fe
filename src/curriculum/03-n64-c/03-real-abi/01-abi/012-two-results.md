---
id: 4422d950-5379-4684-a078-a05f8fa41763
slug: abi-two-results
title: When the First Result Must Survive
difficulty: 3
concepts:
  - abi
  - calls
  - frames
  - locals
symbol: func_80108b64
hints:
  - "The first result is stored to `28(sp)` *and* piped into the second call — it plays two roles, which means the C names it."
  - "After both calls, `t6` is the first result and `v0` the second. The final `addu`'s order tells you the expression."
---

# A local variable is born

Chain two calls, but this time the first result is needed **twice** — once as
the second call's argument, and once more in the final arithmetic. It has to
cross a `jal`, and it isn't an incoming argument, so it has no home slot of its
own. IDO gives it a real slot in the frame instead: the frame grows, and a
store appears that isn't homing. You're looking at a **local variable**.

Here's `delta(n)`: it calls `sample(n)`, calls `sample` again *on that
result*, and returns the second result minus the first:

```asm
addiu  sp, sp, -32
sw     ra, 20(sp)
jal    sample          # sample(n)
nop
sw     v0, 28(sp)      # first result → a frame slot (a local!)
jal    sample
or     a0, v0, zero    # …and also forward into the second call
lw     t6, 28(sp)      # first result, back again
lw     ra, 20(sp)
subu   v0, v0, t6      # second − first
jr     ra
addiu  sp, sp, 32
```

In C that demands a name:

```c
s32 firstV = sample(n);
return sample(firstV) - firstV;
```

The tell that separates this from last lesson's pure pipeline: the
`sw v0, 28(sp)` right after the first call, paired with a `lw` from the same
slot after the second. Result stored *and* forwarded means the C binds it to a
variable and uses it twice. The slot lives at `28(sp)` in a 32-byte frame —
above `ra`, in the function's own local area.

The target has the identical skeleton around a different combination. Check
which register ends up on which side of the final operation.

## Your task

`extern s32 stepOnce(s32 a);` is declared for you. Write `func_80108b64` to
reproduce the target assembly.

<!-- solution -->
```c
s32 func_80108b64(s32 n) {
    s32 a = stepOnce(n);
    s32 b = stepOnce(a);
    return a + b;
}
```

<!-- context -->
```c
extern s32 stepOnce(s32 a);
```
