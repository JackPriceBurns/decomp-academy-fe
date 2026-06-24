---
id: advanced-enum-sizing
title: "Enums Are int-Sized: Recovery Is Naming"
difficulty: 3
concepts:
  - enum
  - enum-int
  - types
  - naming
symbol: is_running
hints:
  - With -enum int the enum is 4 bytes, so the field loads with a full `lwz` and
    STATE_RUN is just the value 2.
  - The compare is the standard `subfic` / `cntlzw` / `srwi r3, r0, 5` equality
    idiom — enums add no instructions.
---

# An enum compiles to nothing special

Under the compiler flags used here (`-enum int`, equivalently `#pragma enum int`),
every `enum` is exactly **int-sized — 4 bytes**. That has a liberating
consequence: an enum-typed field and an `int` field generate **identical**
code.

Consider `is_raging(struct Enemy *e)`, which checks whether `e->phase` equals
the third enum value (`PHASE_RAGE = 3`):

```asm
lwz    r0, 0(r3)      # load the 4-byte phase field
subfic r0, r0, 3      # r0 = 3 - phase   (zero iff phase == 3)
cntlzw r0, r0
srwi   r3, r0, 5      # the "==" idiom -> 0/1
blr
```

That `lwz` (a full word, not `lbz`/`lhz`) confirms the field is 4 bytes wide.
One wrinkle from the control chapter: that lesson compared two *variables* with
`subf`, but when one side is a **compile-time constant** MWCC uses
`subfic` instead — subtract-from-immediate — computing `r0 = K - field`, which
is zero exactly when `field == K`. Read the immediate to find the enum ordinal.

The key point: this is byte-for-byte identical whether you write the enum name
(`PHASE_RAGE`) or the bare integer literal (`3`). The enum names contribute
*zero* bytes to the object file.

So **recovering an enum is a naming decision, not a codegen one.** When the asm
loads a 4-byte field and compares it against a small constant via `subfic`, you
can introduce an `enum` and meaningful names — it won't change a single
instruction, it just makes the C readable and the intent obvious. Look up what
ordinal position the constant corresponds to in the provided enum to choose the
right name.

## Your task

Write `is_running(struct Actor *a)` to match the assembly above. The
`State` enum and `Actor` struct are provided. Confirm for yourself that
replacing the enum constant with its numeric value produces the same asm.

<!-- starter -->
```c
int is_running(struct Actor *a) {
    return 0;
}
```

<!-- solution -->
```c
int is_running(struct Actor *a) {
    return a->state == STATE_RUN;
}
```

<!-- context -->
```c
typedef enum { STATE_IDLE, STATE_WALK, STATE_RUN, STATE_JUMP } State;
struct Actor { State state; int hp; };
```
