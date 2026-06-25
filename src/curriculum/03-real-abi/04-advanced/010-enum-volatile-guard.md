---
id: advanced-enum-volatile-guard
title: "Chain: Enum Guard, Then a Volatile Sum"
difficulty: 4
concepts:
  - enum
  - volatile
  - cse
  - guard
  - chaining
symbol: sample
hints:
  - The enum field load + `cmpwi K` + `bnelr-` is a one-line guard; the `li r3,-1`
    is parked speculatively before the compare so the bail value is already in
    place.
  - Past the guard, the volatile global is read twice — two `lwz` of the same
    @sda21 symbol with no store between — and summed.
---

# A typed gate in front of a volatile read

Engine code often refuses to touch hardware unless the object is in the right
state. That's two idioms back to back: an **enum** state check (lesson 5) acting
as an early-return *guard*, and then — only if the guard passes — a **volatile**
access that defeats CSE (lesson 6). Reading the asm means splitting it at the
conditional branch: everything before is the guard, everything after is the work.

Consider `read_if_armed(struct Sensor *s)`, which bails with a sentinel unless
`s->state` is the enum value `ARMED` (ordinal 1), then reads a
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

The guard is the `lwz`/`cmpwi K`/`bnelr-` trio: load the enum field, compare
against an ordinal, and `bnelr-` returns early when it doesn't match — with the
sentinel already sitting in `r3` from the speculative `li`. (Pick a non-zero
sentinel: a `return 0` arm lets MWCC flatten the whole guard into a branchless
mask, hiding the `bnelr-`.) Past the branch, the
**two `lwz` of the same `@sda21` symbol with no store between** is the volatile
double-read fingerprint: a plain `int` would load once and `add r3, r0, r0`.

## Your task

Write `sample(struct Dev *d)` to reproduce the assembly above. The `Mode` enum,
`Dev` struct, and the `volatile int g_ticks` are provided in context. Read the
`cmpwi` immediate to find which enum value passes the guard and the `li` to find
the sentinel; the global must be read twice past the guard.

<!-- starter -->
```c
int sample(struct Dev *d) {
    return 0;
}
```

<!-- solution -->
```c
int sample(struct Dev *d) {
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
