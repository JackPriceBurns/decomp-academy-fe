---
id: 37308e6a-88f1-4820-b4c0-2eba9403c3ca
slug: mastery-stick-deadzone
title: The Joystick Deadzone
difficulty: 3
concepts:
  - real-code
  - narrow-types
  - branches
  - globals
symbol: func_801cc238
hints:
  - "There are three early exits before the main work: a test of a global u8, then a range test in two parts built from `slti 8` and `slti -7`. Both dead zones return the same value."
  - "The `blezl` separates positive values from non-positive ones. Each side moves the value toward zero by the same amount, then clamps it. Read each `slti` immediate and the constant loaded on the clamping path."
---

# Every stick read passes through here

This is real input code. The game runs this function on every raw joystick
axis, every frame. Sticks drift, so tiny values must read as zero. Old hardware
gives different ranges, so big values must be clamped. The C is a series of
small `if`s on a narrow signed value, so the assembly shows how this compiler
handles narrow signed math.

In a register, an `s8` is an `s32` whose value is expected to stay small. After
arithmetic, the compiler must *re-narrow* it. On this CPU that is the
`sll` 24 / `sra` 24 pair from tier 2. Here is `throttleUp`, which raises a
throttle a little and then clamps it:

```asm
 0:  sw    a0, 0(sp)         # narrow arg homed (the -g3 ritual)
 4:  sll   t6, a0, 24
 8:  sra   a0, t6, 24        # re-extend the incoming s8
 c:  addiu a0, a0, 5         # t + 5
10:  sll   t8, a0, 24
14:  sra   a0, t8, 24        # the sum is an int: narrow it back to s8
18:  slti  at, a0, 91        # t < 91, i.e. t <= 90
1c:  bnezl at, 0x2c          # in range → skip the clamp
20:  or    v0, a0, zero      #   (slot) result = t
24:  addiu a0, zero, 90      # clamp value
28:  or    v0, a0, zero
2c:  jr    ra
30:  nop
```

Two rules for reading this code:

- **`slti` immediates are off by one from the C.** `slti at, a0, 91` with
  "skip if true" means `<= 90`. On the negative side, `slti at, a0, -7` being
  *false* means `> -8`. When you see an unusual immediate, add or subtract one,
  and work out which comparison the branch direction implies.
- **You do not write the `sll`/`sra` pairs.** They come from the variable being
  `s8`. Declare the right type and the compiler adds them.

The target starts with something extra: an `lbu` from a global. This is the
engine's "ignore the stick" flag, and it is tested before anything else. The
global's name is in the reloc, and the context declares it. After that come the
`if`s: a dead zone that returns zero, then a positive path and a negative path.
Each path moves the value toward zero and then clamps it. Follow each branch to
its `jr ra` and note what is in `v0` when it gets there.

## Your task

Write `func_801cc238` to reproduce the target assembly.

<!-- solution -->
```c
s8 func_801cc238(s8 stick) {
    s8 adjustedStick;

    if (gIgnoreJoystick) {
        return 0;
    }

    if (stick < 8 && stick > -8) {
        return 0;
    }

    if (stick > 0) {
        stick = stick - 8;

        if (stick > 70) {
            stick = 70;
        }

        adjustedStick = stick;
    } else {
        stick = stick + 8;

        if (stick < -70) {
            stick = -70;
        }

        adjustedStick = stick;
    }

    return adjustedStick;
}
```

<!-- context -->
```c
extern u8 gIgnoreJoystick;
```
