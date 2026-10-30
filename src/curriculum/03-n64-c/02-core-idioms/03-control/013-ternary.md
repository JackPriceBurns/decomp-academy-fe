---
id: 20ec746e-c90c-40fe-8640-19a9bd8c2804
slug: control-ternary
title: The Ternary Diamond
difficulty: 3
concepts:
  - control-flow
  - branches
  - fingerprints
symbol: func_8003b1d0
hints:
  - "Two arms compute into `v1`, one in the branch's slot and one in the `b`'s slot. Then the join copies the result to `v0`. Read what each arm computes."
  - "The branch is `beqz`, so its slot holds the value for the ZERO case. Get the two expressions on the right sides of the `:`."
---

# Two arms, one join

The ternary `?:` produces a shape you will learn to recognize quickly. Here is
`return x ? a : b;`:

```asm
 0:  beqz a0, 0x10       # x == 0? the else-arm
 4:  or   v1, a2, zero   # (delay slot) v1 = b, the else value
 8:  b    0x10           # unconditional jump to the join
 c:  or   v1, a1, zero   # (delay slot) v1 = a, the then value
10:  or   v0, v1, zero   # the join: whichever arm ran, copy to v0
14:  jr   ra
18:  nop
```

Three things make this a **diamond** instead of a ladder:

- **Both arms write the same scratch register.** Each path puts its value in
  `v1`, and a single join line moves `v1` into `v0`. This flow (two arms, then
  a join, through an extra register) is the sign of a ternary. Early returns
  (a ladder) would each have their own `jr ra` instead.
- **`b` is the unconditional branch.** It has no condition and is always
  taken. Its only job is to send the then-arm to the join point. It has a
  delay slot like any branch, and here the slot *is* the then-arm.
- **Each arm is in a slot.** The else value is under the `beqz`, and the then
  value is under the `b`. There are four instructions of logic, and two of
  them are in delay slots. If you only read the lines that are not slots, this
  function looks empty.

Decode order: take the condition from the branch (flipped: `beqz` means the
`x == 0` case goes to the *else* value), then read each arm's expression from
its slot. The result is one line of C.

In the target, the arms are more than plain copies. Each one *computes*
something with the same two values before the result goes into `v1`. It is the
same diamond, with one operation per arm.

## Your task

Write `func_8003b1d0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8003b1d0(s32 f, s32 a, s32 b) {
    return f ? a + b : a - b;
}
```
