---
id: 34fd658d-25fe-59c3-a7fc-d7d46447bff6
slug: advanced-enum-sizing
title: "Enums Are int-Sized: Recovery Is Naming"
difficulty: 3
concepts:
  - enum
  - enum-int
  - types
  - naming
symbol: func_8013f594
hints:
  - With -enum int the enum is 4 bytes, so the field loads with a full `lwz` and
    STATE_RUN is just the value 2.
  - The compare is the standard `subfic` / `cntlzw` / `srwi r3, r0, 5` equality
    idiom — enums add no instructions.
---

# An enum compiles to nothing special

Here the compiler runs with `-enum int` (the same as `#pragma enum int`), which
pins every `enum` to 4 bytes, the width of an `int`. An enum-typed field therefore
compiles to exactly the instructions an `int` field would.

Take `is_raging(struct Enemy *e)`, which asks whether `e->phase` holds the third
enum value `PHASE_RAGE = 3`:

```asm
lwz    r0, 0(r3)      # load the 4-byte phase field
subfic r0, r0, 3      # r0 = 3 - phase   (zero iff phase == 3)
cntlzw r0, r0
srwi   r3, r0, 5      # the "==" idiom -> 0/1
blr
```

The `lwz` reads a full word rather than `lbz` or `lhz`, so the field is genuinely
4 bytes. Something shifted since the control chapter, where comparing two
*variables* produced `subf`. With a compile-time constant on one side, MWCC emits
`subfic` (subtract-from-immediate) and computes `r0 = K - field`, which is zero
precisely when `field == K`, so the immediate stands in for the enum ordinal you
need to identify.

You can write `PHASE_RAGE` or the literal `3` and the object file comes out
byte-for-byte the same, because the names never reach the machine code.

So when you find a 4-byte field compared against a small constant through
`subfic`, reintroducing an `enum` with descriptive names costs nothing in codegen
and makes the C readable again. Find the right name by counting the constant's
position in the provided enum.

## Your task

Write `func_8013f594` to match the assembly above. The `State` enum and `Actor`
struct are provided. Confirm for yourself that replacing the enum constant with
its numeric value produces the same asm.

<!-- solution -->
```c
int func_8013f594(struct Actor *a) {
    return a->state == STATE_RUN;
}
```

<!-- context -->
```c
typedef enum { STATE_IDLE, STATE_WALK, STATE_RUN, STATE_JUMP } State;
struct Actor { State state; int hp; };
```
