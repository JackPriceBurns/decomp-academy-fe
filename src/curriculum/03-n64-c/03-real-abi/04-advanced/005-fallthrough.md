---
id: 076994a7-d1cd-4499-b282-d0799a22870d
slug: adv-fallthrough
title: The Missing break
difficulty: 4
concepts:
  - switch
  - control-flow
  - fallthrough
  - fingerprints
symbol: func_801da650
hints:
  - "Follow each case's body to where it ends up. One of them runs on into an instruction that another case also executes. That is your fallthrough."
  - "A constant in the target can be the SUM of an initial value and one or more `+=` steps that the compiler folded together. Split it back into those parts."
---

# Falling into the next case

If you leave out a `break`, control *falls through* into the next case's
body. In the source, this C feature can look like a bug. Real code does use
it, and the assembly shows it clearly. Here is `fee(k)`: `f` starts
at 1, case 0 sets it to 6, and case 1 adds 10 **and falls through** into
case 2, which adds 20:

```asm
 0:  beqz   a0, 0x24          # case 0?
 4:  addiu  v1, zero, 1       #   slot: f = 1 (the initial value)
 8:  addiu  at, zero, 1
 c:  beq    a0, at, 0x2c      # case 1?
10:  addiu  at, zero, 2
14:  beql   a0, at, 0x34      # case 2: likely form…
18:  addiu  v1, v1, 20        #   …slot runs only when taken: f += 20
1c:  b      0x38              # no case matched
20:  or     v0, v1, zero
24:  b      0x34              # case 0: jump to the exit…
28:  addiu  v1, zero, 6       #   …setting f = 6 on the way
2c:  addiu  v1, zero, 11      # case 1: f += 10, FOLDED to f = 11 (1+10)
30:  addiu  v1, v1, 20        # …then case 2's f += 20 happens too
34:  or     v0, v1, zero
38:  jr     ra
3c:  nop
```

Look closely at `0x2c` to `0x30`. Case 1's body does not end with a jump. It
runs straight into an `f += 20`, which is the same operation case 2 performs.
When one case runs on into the next case's code like this, that is
fallthrough, and you can see it in the order of the instructions.

Two fingerprints help you read it:

- **Constant folding hides the arithmetic.** `f` was 1 and case 1 adds 10, so
  the compiler writes 11 directly. When a case's constant does not match the
  constant you expect from the source, check whether it is a running total.
- **The same case can look different when it is reached directly and when
  it is fallen into.** When case 2 is entered through its own `beql`, the
  `+= 20` sits in the likely slot, which is annulled if the branch is not
  taken. After case 1's body, the same `+= 20` is copied as a plain
  instruction. One C statement appears in two places.

The target is a three-case switch. It has one missing `break` and folded
constants of its own. Follow each entry path to the exit and work out what
the result register holds on each one.

## Your task

Write `func_801da650` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801da650(s32 t) {
    s32 x = 0;

    switch (t) {
    case 0:
        x += 4;
    case 1:
        x += 2;
        break;
    case 2:
        x = 9;
        break;
    }
    return x;
}
```
