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
  - "Three early exits before the real work — a global u8 test, then a two-part range test built from `slti 8` and `slti -7`. Both dead zones return the same thing."
  - "The `blezl` splits positive from non-positive. Each side shifts the value toward zero by the same amount, then clamps — read each `slti` immediate and the constant loaded on the clamping path."
---

# Every stick read passes through here

This is real input code: the function the game runs on every raw joystick axis,
every frame. Sticks drift, so tiny values must read as zero; old hardware ranges
vary, so big values must clamp. The C is a ladder of small `if`s on a narrow
signed value — which makes the assembly a study in how this compiler handles
narrow signed math.

An `s8` in a register is just an `s32` that promises to stay small. After
arithmetic the compiler must *re-narrow* it, and on this CPU that's the
`sll` 24 / `sra` 24 pair from tier 2. Watch `throttleUp` nudge and clamp a
throttle:

```asm
 0:  sw    a0, 0(sp)         # narrow arg homed — the -g3 ritual
 4:  sll   t6, a0, 24
 8:  sra   a0, t6, 24        # re-extend the incoming s8
 c:  addiu a0, a0, 5         # t + 5
10:  sll   t8, a0, 24
14:  sra   a0, t8, 24        # the sum is an int — squeeze it back to s8
18:  slti  at, a0, 91        # t < 91, i.e. t <= 90
1c:  bnezl at, 0x2c          # in range → skip the clamp
20:  or    v0, a0, zero      #   (slot) result = t
24:  addiu a0, zero, 90      # clamp value
28:  or    v0, a0, zero
2c:  jr    ra
30:  nop
```

Two reading rules to carry in:

- **`slti` immediates are off by one from the C.** `slti at, a0, 91` paired
  with "skip if true" is `<= 90`; on the negative side, `slti at, a0, -7`
  being *false* means `> -8`. When you see a strange immediate, add or
  subtract one and ask which comparison the branch sense implies.
- **The `sll`/`sra` pairs are free.** They come from the variable being `s8`,
  not from anything you write. Declare the right type and they appear.

The target opens with something extra: a `lbu` from a global — the engine's
"ignore the stick" flag, tested before anything else. The global's name is in
the reloc, and the context declares it. After that it's the ladder: a dead
zone that returns zero, then a positive path and a negative path, each with a
shift-toward-zero and a clamp. Follow each branch to its `jr ra` and note
what's in `v0` when it gets there.

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
