---
id: f6fef480-94f4-4347-a58c-0f33eca7ff86
slug: gba-structs-capstone
title: "Capstone: An Entity Update"
difficulty: 5
concepts:
  - structs
  - bitwise
  - control-flow
hints:
  - Take the target in three pieces — the flag test, the guarded work, and the
    subtraction at the end — and name the field each memory access touches
    before you write any C.
  - A `struct Entity *` in, an `s32` out. One local starts from a narrow field,
    a flag decides whether something is added to it, and the field at 124 is
    what it gets taken away from.
symbol: func_0827fa78
---

# Everything at once

Real entity-update code is exactly what this chapter has been building towards:
a byte of flags, a couple of narrow counters, and a payload big enough to push
the interesting fields past the addressing ceiling. This target uses all three
at once.

Here is a function over a window record — a byte flag, a halfword field, and a
pair of words either side of the 124-byte limit:

```asm
0        mov       r2, r0
2        ldrb      r1, [r2, #5]
4        mov       r0, #32
6        and       r0, r1
8        cmp       r0, #0
10       bne       20 ~>
12       ldrb      r1, [r2, #4]
14       ldr       r0, [r2, #124]
16       add       r0, r1
18       b         30 ~>
20     ~>mov       r0, r2
22       add       r0, #128
24       ldrh      r1, [r2, #0]
26       ldr       r0, [r0, #0]
28       sub       r0, r1
30     ~>bx        lr
```

Three things to pick out. The flag test at 2 to 10 is the standard shape: load
the byte, put the mask in a scratch register, `and`, compare against zero. The
`bne` jumps *forward* to the code for the true case, so the fall-through path at
12 is the `else` — a taken branch means the condition held.

Instructions 20, 22 and 26 are one field access, with the `ldrh` for a different
field slipped in among them. The struct base is in `r2`, and this time the `add`
does not clobber it, because `r2` is still needed for that `ldrh`. So the
compiler copies the base with `mov r0, r2` and does the `add` on the copy —
three instructions to read the field at 128, where the field at 124 took one.

That is the pattern to carry into your own target. The `add` lands on whichever
copy of the pointer nothing needs again — a fresh `mov` copy when the base still
has another field to serve, the base register itself when it does not. Either
way the `mov`, the `add` and the load at `[rD, #0]` are one field access, and
anything sitting between them belongs to a different one.

Your target tests a flag of its own, does work only on one side of the branch,
and finishes with a subtraction. Work every offset against the struct in the
context block — there is an array in the middle, and the size of that array is
what puts the last two fields where they are.

## Your task

Write `func_0827fa78` to reproduce the target assembly.

<!-- context -->
```c
struct Entity {
    u8 flags;
    u8 kind;
    u16 timer;
    s32 x;
    s32 y;
    u32 anim[28];
    s32 hp;
    s32 armor;
};
```

<!-- solution -->
```c
s32 func_0827fa78(struct Entity *e) {
    s32 d = e->timer;
    if (e->flags & 4) {
        d = d + e->armor;
    }
    return e->hp - d;
}
```
