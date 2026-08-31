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
  - "Two arms compute into `v1` — one in the branch's slot, one in the `b`'s slot — then the join copies to `v0`. Read what each arm computes."
  - "The branch is `beqz`, so its slot holds the value for the ZERO case. Get the two expressions on the right sides of the `:`."
---

# Two arms, one join

The ternary `?:` produces a shape you'll learn to spot from across the room.
Here's `return x ? a : b;`:

```asm
 0:  beqz a0, 0x10       # x == 0? the else-arm
 4:  or   v1, a2, zero   # (delay slot) v1 = b — the else value
 8:  b    0x10           # unconditional hop to the join
 c:  or   v1, a1, zero   # (delay slot) v1 = a — the then value
10:  or   v0, v1, zero   # the join: whichever arm ran, copy to v0
14:  jr   ra
18:  nop
```

Three things make this a **diamond**, not a ladder:

- **Both arms write the same scratch register.** Each path deposits its
  value in `v1`, and a single join line moves `v1` into `v0`. That
  arm-arm-join flow through an intermediate register is the ternary's
  signature — early returns (a ladder) would each have their own `jr ra`
  instead.
- **`b` is the unconditional branch.** No condition, always taken — it
  exists purely to jump the then-arm over the join point's fall-in. And
  yes, it has a delay slot like any branch; here the slot *is* the
  then-arm.
- **Each arm lives in a slot.** The else-value under the `beqz`, the
  then-value under the `b`. Four instructions of logic, two of them in
  shadows — if you only read non-slot lines, this function looks empty.

Decode order: condition off the branch (flipped — `beqz` means the `x == 0`
case goes to the *else* value), then each arm's expression out of its slot.
One line of C.

In the target, the arms aren't bare copies — each one *computes* something
with the same two values before it lands in `v1`. Same diamond, one
operation per arm.

## Your task

Write `func_8003b1d0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8003b1d0(s32 f, s32 a, s32 b) {
    return f ? a + b : a - b;
}
```
