---
id: 731c1c87-235b-4855-9163-24190f407f2a
slug: arithmetic-add-registers
title: Adding Two Registers
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: func_800c7070
hints:
  - "Each `addu` adds two registers; a sum with more than one step parks the intermediate in a temporary before the final result lands in `v0`."
  - "Read the target top to bottom and track which arguments have been folded in by each line."
---

# When both sides are runtime values

Warmup taught you `addiu` — addition with a constant folded into the
instruction. But when *both* operands are values that only exist at runtime,
there's nothing to fold. The compiler uses the register form, `addu rd, rs, rt`:

```asm
addu v0, a0, a1    # v0 = a0 + a1
jr   ra
nop
```

That's `add2(x, y)` returning `x + y`. Destination first, as always — and the
`u` is still our old friend "don't trap on overflow", not "unsigned". Plain
signed addition compiles to `addu`.

One more habit to learn while we're here. When a computation takes more than one
step, the intermediate result has to live *somewhere*, and IDO is a creature of
routine about where: it burns temporaries in order starting at **`t6`**, then
`t7`, `t8`… You'll see `t6` holding a partial result constantly in this
compiler's output, and now you know it's nothing special — just the first
scratch register on IDO's list.

The target below is one step longer than the example. Watch where the partial
sum lands, and which argument joins last.

## Your task

Write `func_800c7070` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800c7070(s32 a, s32 b, s32 c) {
    return a + b + c;
}
```
