---
id: finale-real-jumptable-volatile-dispatch
title: "★ A Jump-Table of Volatile Reads"
difficulty: 5
concepts:
  - finale
  - switch
  - jump-table
  - enum
  - volatile
  - globals
  - highlight
symbol: sampleChannel
hints:
  - "Eight dense enum cases force a jump table: `cmplwi 7` / `bgt-` bounds check,
    then `slwi`/`lwzx`/`mtctr`/`bctr` dispatch."
  - Each non-default case reads a volatile global and adds a small constant; the
    `volatile` is why the `lwz` reappears in every arm instead of being hoisted.
  - The enum arrives as a plain 4-byte int in the first arg — naming only, no
    codegen cost; the default arm returns the sentinel.
---

# Three advanced idioms stacked in one dispatch

The advanced chapter's pieces rarely appear alone in real code. A per-frame
handler dispatches on an **enum** state through a **jump table**, and each arm
reads a **volatile** global before returning. That is three lessons fused: the
`enum` (the state is just a 4-byte int — naming, no codegen cost), the
**jump-table switch** (enough dense cases to cross the threshold from a decision
tree into a `lwzx`/`mtctr`/`bctr` indirect jump), and the **volatile read** (the
`lwz` of the global survives separately in every arm because `volatile` forbids
hoisting it out).

The fingerprint is the dense table head followed by a fan of nearly identical
arms. Consider `readMode`, eight enum states each reading a sensor register and
offsetting it:

```asm
cmplwi r3,7                # 8 dense cases: bounds-check the state
bgt-   .default
lis    r4,@16@ha           # base of the jump table
slwi   r0,r3,2            # state * 4 = table offset
addi   r3,r4,@16@l
lwzx   r0,r3,r0           # load the case address
mtctr  r0
bctr                      # jump straight to the arm
.case0:
li     r3,0               # MODE_OFF -> 0
blr
.case1:
lwz    r3,gSensor@sda21(r13) # volatile read survives, per-arm
addi   r3,r3,10           # + 10
blr
.case2:
lwz    r3,gSensor@sda21(r13) # ...and again, not CSE'd away
addi   r3,r3,20
blr
# ... one arm per state ...
.default:
li     r3,-1              # out of range -> sentinel
blr
```

Two things to read carefully. First, the `cmplwi`/`bgt-`/`slwi`/`lwzx`/`mtctr`/
`bctr` head is the jump table — present only because the cases are dense and
plentiful. Second, every arm reloads the global with its own `lwz`: that
repetition, with no store between, is the `volatile` signature — drop the
`volatile` and the optimizer would hoist one load before the switch.

Your `sampleChannel` has the same eight-arm shape, but it dispatches a
**different enum** and each arm adds a **different constant** to the volatile
read. Recover the enum from the case order, the bound from `cmplwi`, and each
arm's offset from its `addi`.

## Your task

The `Channel` enum and the `volatile int gReg` are provided in context. Write
`sampleChannel`, taking a `Channel`, to reproduce the assembly above. Read the
table head to confirm the case count, and each arm's `addi` for its offset; the
`default` arm returns the sentinel.

<!-- starter -->
```c
int sampleChannel(Channel c) {
    return 0;
}
```

<!-- solution -->
```c
int sampleChannel(Channel c) {
    switch (c) {
        case CH_IDLE: return 0;
        case CH_ARM:  return gReg + 1;
        case CH_FIRE: return gReg + 2;
        case CH_COOL: return gReg + 3;
        case CH_HOLD: return gReg + 4;
        case CH_VENT: return gReg + 5;
        case CH_LOCK: return gReg + 6;
        case CH_DUMP: return gReg + 7;
        default:      return -1;
    }
}
```

<!-- context -->
```c
typedef enum {
    CH_IDLE, CH_ARM, CH_FIRE, CH_COOL, CH_HOLD, CH_VENT, CH_LOCK, CH_DUMP
} Channel;
extern volatile int gReg;
```
