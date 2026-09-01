---
id: 4ef40e2d-3e32-48ac-85aa-6cc8141864ab
slug: gba-mastery-input-edge
title: Detecting a Button Press
difficulty: 4
concepts:
  - hardware-registers
  - bitwise
  - globals
hints:
  - "`bic rd, rn` is `rd = rd & ~rn`, so the register that ends up in the
    destination is the operand that was *not* complemented. Two `bic`s means
    two `~` in the source, on opposite sides of their `&`."
  - The pool has four words - a hardware register address, a mask, and two named
    globals. 67109168 is 0x04000130, and the value stored to one global is not
    the value stored to the other.
  - "Nothing goes in and nothing comes out. `gNewKeys` receives the buttons that
    went down this frame, `gHeldKeys` receives everything currently down, and
    `gHeldKeys` is written last so the next call can compare against it."
symbol: func_08419a28
---

# What changed since last frame

`REG_KEYINPUT` at 0x04000130 reports the GBA's buttons active low: a bit reads 0
while its button is held and 1 while it is up. Only the bottom ten bits mean
anything. So the first thing every game does with it is invert it and mask off
the rest, which turns "not pressed" back into 0 and gives a sane bitmask of
what is down.

That gives you *held*, and held is the wrong thing for a menu. Pressing A on a
menu should move the cursor once, not sixty times a second. To get *pressed*
you need the buttons that are down now and were not down last frame, and the
only way to know last frame is to have kept it - in a global, written at the end
of every one of these calls.

Thumb spells "clear these bits" as `bic`, and its two-operand form is
`rd = rd & ~rn`. Read that carefully, because it inverts how the source looked:
the operand that keeps its bits ends up in the **destination**, and the one
wearing the `~` is the source. Here is a global being diffed against an
argument:

```asm
0        ldr       r1, [pc, #8] (->12)
2        ldr       r1, [r1, #0]
4        bic       r1, r0
6        mov       r0, r1
8        bx        lr
10       .hword    0
12       .word     gPrevFlags
```

The global is loaded into `r1` and stays there as the destination, so the global
is the un-complemented side and the argument in `r0` is the one being inverted.
The trailing `mov r0, r1` is gcc 2.9 computing into the wrong register and
copying - reproduce it, do not chase it.

Turn the operands around and the destination changes with them:

```asm
0        ldr       r0, [pc, #8] (->12)
2        ldrh      r1, [r0, #0]
4        mov       r0, #48
6        bic       r0, r1
8        bx        lr
10       .hword    0
12       .word     67109170
```

Now the mask 48 is built into the destination and the register read from
hardware is complemented, which is the shape a `~REG & MASK` always takes. 48
fits in an 8-bit immediate so a `mov` is enough; a wider mask would have cost a
second pool word.

Your target holds two of these, back to back, and its pool tells you almost
everything before you read an instruction. Work out which side of each `&`
carried the `~`, then which global is written first.

## Your task

Write `func_08419a28` to reproduce the target assembly.

<!-- context -->
```c
#define REG_KEYINPUT (*(vu16 *)0x04000130)
extern u16 gHeldKeys;
extern u16 gNewKeys;
```

<!-- solution -->
```c
void func_08419a28(void)
{
    u16 now;

    now = ~REG_KEYINPUT & 0x3FF;
    gNewKeys = now & ~gHeldKeys;
    gHeldKeys = now;
}
```
