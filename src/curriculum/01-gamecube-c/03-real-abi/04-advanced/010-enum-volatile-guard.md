---
id: 3b0915d3-44d5-5140-b1a6-65dc2242dba7
slug: advanced-enum-volatile-guard
title: "Chain: Enum Guard, Then a Volatile Sum"
difficulty: 4
concepts:
  - enum
  - volatile
  - cse
  - guard
  - chaining
symbol: func_802c2454
hints:
  - The enum field load + `cmpwi K` + `bnelr-` is a one-line guard; the `li r3,-1`
    is parked speculatively before the compare so the bail value is already in
    place.
  - Past the guard, the volatile global is read twice — two `lwz` of the same
    @sda21 symbol with no store between — and summed.
---

# A typed gate in front of a volatile read

Engine code often refuses to touch hardware until the object is in the right
state. What you get is two idioms back to back. First an `enum` state check, the
kind from lesson 5, acts as an early-return guard, and only when that guard
passes does the function reach a `volatile` access that defeats CSE, the kind
from lesson 6. To read the assembly, split it at the conditional branch:
everything ahead of the branch is the guard, and everything past it is the actual
work.

Take `read_if_armed(struct Sensor *s)`, which bails out with a sentinel unless
`s->state` is the enum value `ARMED` (ordinal 1), and otherwise reads a
`volatile int g_raw` twice:

```asm
lwz   r0, 0(r3)            # load the 4-byte enum field
li    r3, -1              # park the bail value speculatively...
cmpwi r0, 1               # ...is state == ARMED (ordinal 1)?
bnelr-                    # no -> return r3 (= -1) right here
lwz   r3, g_raw@sda21(r2) # yes: first volatile read
lwz   r0, g_raw@sda21(r2) # second read — volatile, not CSE'd
add   r3, r3, r0
blr
```

The guard is that `lwz`/`cmpwi K`/`bnelr-` trio. It loads the enum field,
compares it against an ordinal, and `bnelr-` returns straight away when the two
differ, with the sentinel already waiting in `r3` thanks to the speculative
`li`. One thing worth knowing: the sentinel needs to be non-zero, because a
`return 0` arm lets MWCC flatten the guard into a branchless mask and the
`bnelr-` disappears. Once you're past the branch, the two `lwz` of the same
`@sda21` symbol with nothing storing between them is the volatile double-read
fingerprint — a plain `int` would have loaded once and done `add r3, r0, r0`.

## Your task

Write `sample(struct Dev *d)` to reproduce the assembly above. The `Mode` enum,
`Dev` struct, and the `volatile int g_ticks` are provided in context. Read the
`cmpwi` immediate to find which enum value passes the guard and the `li` to find
the sentinel; the global must be read twice past the guard.

<!-- solution -->
```c
int func_802c2454(struct Dev *d) {
    if (d->mode != MODE_HIGH) return -1;
    return g_ticks + g_ticks;
}
```

<!-- context -->
```c
typedef enum { MODE_OFF, MODE_LOW, MODE_HIGH } Mode;
struct Dev { Mode mode; };
extern volatile int g_ticks;
```
