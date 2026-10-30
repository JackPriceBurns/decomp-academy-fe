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
    result minus the value saved in r4. The `mul` scales that difference, and
    `asr #8` removes the fraction bits again."
  - The final `mov r0, r4` shows that the sum was built in r4. That tells you
    which side of the outer `+` the shifted term is on.
  - "`s32 func_083f6a88(s32 y, s32 t, s32 idx)` is the signature. The result is
    `y` moved a fraction `t` of the way toward `heightAt(idx)`, with `t` in Q8."
---

# Fixed point around a call

GBA games use fixed point to handle fractions. A number is stored multiplied by
a power of two. To multiply two such numbers, you do a normal multiply and then
shift right to remove the extra scale. In Q8 the scale is 256, so a multiply by
a Q8 factor is `mul` followed by `asr #8`. A version that rounds adds half a
unit (128) before the shift.

A call in the middle of this adds a cost from the ABI. `mul` needs both of its
operands in registers at the same time, and a `bl` overwrites r0-r3. So any
operand computed before the call has to be kept in a register that the callee
must preserve. Each value kept this way costs one register in the push list and
one `mov` right after the push. The push list therefore tells you how many
values have to survive the call.

Here is `applyDrag`, which scales a velocity by a Q8 friction factor that it
gets from a call:

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

Address 2 saves the velocity in r4 before the call can overwrite it. Address 4
moves the other incoming value down into r0, where it becomes the argument.
After the call, the product is placed in r0. The rounding add and the shift keep
it there, so the function returns without any extra move. The value was already
in the right register, r0, as soon as `frictionFor` returned.

Whether that extra move appears depends on how the C is written. In a
two-operand `add`, the destination is the register that holds the **left**
operand of the C addition. `spinUp` computes `base + (tickRate(id) >> 2)`, so
the sum is built in the saved register that holds `base`. Then r0 has to be set
afterward:

```asm
10       asr       r0, #2
12       add       r4, r0
14       mov       r0, r4
```

`spinUp2` computes the same value with the operands in the opposite order, so the
sum is built in r0, where the call left its result:

```asm
10       asr       r0, #2
12       add       r0, r4
```

So the choice between two instructions and one depends only on which side of the
`+` the call's part is on. You cannot add or remove that `mov` directly. It
appears exactly when the saved register is on the left.

Your target keeps two values across the call. It ends with an `add` into a saved
register, followed by a `mov` into r0. Read the operand order of the `sub` right
after the `bl`. Then use that final `mov` to work out the order of the operands
in the outer sum.

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
