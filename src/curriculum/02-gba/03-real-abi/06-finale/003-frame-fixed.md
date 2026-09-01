---
id: 1dd22e65-b308-426c-aa50-3f8d116ff960
slug: gba-realfinale-frame-fixed
title: Fixed Point in a Frame
difficulty: 4
concepts:
  - fixed-point
  - calls
  - frames
symbol: func_083f6a88
hints:
  - "Everything after the `bl` is one expression. `sub r0, r4` is the call's
    result minus the value parked in r4, the `mul` scales that difference, and
    `asr #8` takes the fraction bits back out."
  - The closing `mov r0, r4` says the sum was accumulated in r4, which fixes
    which side of the outer `+` the shifted term sits on.
  - "`s32 func_083f6a88(s32 y, s32 t, s32 idx)`: the answer is `y` moved a
    fraction `t` of the way toward `heightAt(idx)`, with `t` in Q8."
---

# Fixed point around a call

Fixed point is how GBA games do fractions: keep the number scaled up by a power
of two, multiply, then shift the scale back out. In Q8 the scale is 256, so a
multiply by a Q8 factor is `mul` followed by `asr #8`, and a rounding version
adds half a unit — 128 — before the shift.

Wrap a call around that and the ABI starts charging rent. `mul` needs both its
operands in registers at the same instant, and a `bl` destroys r0-r3, so any
operand computed before the call has to be parked somewhere the callee must
preserve. Each parked value costs one register in the push list and one `mov`
immediately after it, which makes the push list a census of how many values have
to outlive the call.

Here is `applyDrag`, scaling a velocity by a Q8 friction factor it has to go and
fetch:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r0, r1
6        bl        frictionFor-4
10       mul       r0, r4
12       add       r0, #128
14       asr       r0, #8
16       pop       {r4}
18       pop       {r1}
20       bx        r1
```

Address 2 parks the velocity in r4 before it can be trampled; address 4 shuffles
the other incoming value down into r0 to be the argument. After the call the
product lands in r0, the bias and the shift keep it there, and the function
returns with no extra move at all — r0 was the right register from the moment
`frictionFor` returned.

That last part depends on how the C is written. The destination of a two-operand
`add` is the register holding the **left** operand of the C addition. `spinUp`
computes `base + (tickRate(id) >> 2)`, so the sum accumulates in the saved
register that holds `base`, and r0 has to be filled in afterward:

```asm
10       asr       r0, #2
12       add       r4, r0
14       mov       r0, r4
```

`spinUp2` computes the same value with the operands written the other way round,
so the sum accumulates where the call already left it:

```asm
10       asr       r0, #2
12       add       r0, r4
```

Two instructions or one, decided entirely by which side of the `+` you put the
call's contribution on. You cannot add that `mov` by hand or take it away; it
appears exactly when the saved register is on the left.

Your target keeps two values across the call and ends with an `add` into a saved
register followed by a `mov` into r0. Read the operand order of the `sub` right
after the `bl`, then let that closing `mov` tell you how to order the outer sum.

## Your task

Write `func_083f6a88` to reproduce the target assembly.

<!-- context -->
```c
extern s32 heightAt(s32 idx);
```

<!-- solution -->
```c
s32 func_083f6a88(s32 y, s32 t, s32 idx) {
    return y + (((heightAt(idx) - y) * t) >> 8);
}
```
