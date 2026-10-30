---
id: 4422d950-5379-4684-a078-a05f8fa41763
slug: abi-two-results
title: When the First Result Is Needed Again
difficulty: 3
concepts:
  - abi
  - calls
  - frames
  - locals
symbol: func_80108b64
hints:
  - "The first result is stored to `28(sp)` *and* passed to the second call. It is used in two places, which means the C gives it a name."
  - "After both calls, `t6` holds the first result and `v0` holds the second. The operand order of the final `addu` tells you the expression."
---

# A local variable in the frame

Chain two calls again, but this time the first result is needed **twice**:
once as the second call's argument, and once more in the final arithmetic. It
has to be kept across a `jal`, and it is not an incoming argument, so it has no
home slot of its own. Instead, IDO gives it a real slot in the frame. The frame
grows, and a store appears that is not homing. This is a **local variable**.

This is `delta(n)`. It calls `sample(n)`, calls `sample` again *on that
result*, and returns the second result minus the first:

```asm
addiu  sp, sp, -32
sw     ra, 20(sp)
jal    sample          # sample(n)
nop
sw     v0, 28(sp)      # first result stored to a frame slot (a local)
jal    sample
or     a0, v0, zero    # and also passed to the second call
lw     t6, 28(sp)      # first result, loaded back
lw     ra, 20(sp)
subu   v0, v0, t6      # second − first
jr     ra
addiu  sp, sp, 32
```

In C, the value needs a name:

```c
s32 firstV = sample(n);
return sample(firstV) - firstV;
```

This is different from the chain of calls in the last lesson. The sign is the
`sw v0, 28(sp)` right after the first call, together with a `lw` from the same
slot after the second call. When a result is stored *and* passed on, the C
assigns it to a variable and uses it twice. The slot is at `28(sp)` in a
32-byte frame, above `ra`, in the function's own local area.

The target has the same structure, with a different final combination. Check
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
