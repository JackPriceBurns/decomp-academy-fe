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
code. Compare a struct field against an enum constant:

```asm
lwz    r0, 0(r3)      # load the 4-byte state field
subfic r0, r0, 2      # r0 = 2 - state   (zero iff state == 2)
cntlzw r0, r0
srwi   r3, r0, 5      # the "== " idiom -> 0/1
blr
```

That `lwz` (a full word, not `lbz`/`lhz`) confirms the field is 4 bytes wide,
and the `subfic`/`cntlzw`/`srwi` is the plain equality idiom you already know.
One wrinkle: the control chapter compared two *variables* with `subf`, but here
one side is the **compile-time constant** `2`, so MWCC folds it into a single
`subfic r0, r0, 2` (subtract-from-immediate, computing `r0 = 2 - state`, zero
exactly when `state == 2`). Same logical operation, immediate form.
Now here's the point: **this is byte-for-byte the same** whether you wrote
`a->state == STATE_RUN` with a real enum or `a->state == 2` with a bare `int`
and a magic number. The enum names contribute *zero* bytes.

So **recovering an enum is a naming decision, not a codegen one.** When the asm
compares a 4-byte field against small integer constants `0, 1, 2, 3...`, you're
free to introduce an `enum` and meaningful names — it won't change a single
instruction, it just makes the C readable and the intent obvious.

## Your task

Write `is_running(struct Actor *a)` to match the assembly above. The
`State` enum and `Actor` struct are provided. Confirm for yourself that
replacing `STATE_RUN` with the literal `2` produces the same asm.

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
