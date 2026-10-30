---
id: 933a5a2e-8a6a-4cc3-896d-c2ccc97d684d
slug: finale-entity-sweep
title: "Grand Capstone: The Entity Sweep"
difficulty: 5
concepts:
  - loops
  - unrolling
  - structs
  - flags
  - types
  - capstone
symbol: func_800ce968
hints:
  - "Collapse the unroll first. Read only the remainder loop (up to its `bne`/`addiu` back-edge), and you have the whole body for one element. The stanzas are that body ×4."
  - "For each element there is a flag *test* (this time the code continues when the bit IS set), then an `lh` compared against zero, with a `bgtzl` that skips. After that, an `andi` clears the bit with a mask, the result is stored back, and a counter is incremented."
---

# A twelve-line body, repeated four times

This is the classic sweep that game code runs every frame. It walks
every entity, tests a condition, changes some state, and counts how many
entities it changed. It is the longest listing in the tier, but by now
none of it is new to you. Here is `wakeIdle`, which scans an array of
`Bot`s and wakes any sleeping bot with enough charge:

```c
typedef struct {
    u8  flags;    // offset 0, bit 1 = "awake"
    u8  pad;
    s16 charge;   // offset 2
} Bot;

s32 wakeIdle(Bot *b, s32 n) {
    s32 woke = 0;
    s32 i;
    for (i = 0; i < n; i++) {
        if ((b[i].flags & 2) == 0 && b[i].charge > 50) {
            b[i].flags |= 2;
            woke++;
        }
    }
    return woke;
}
```

```asm
  0:  or    v1, zero, zero    # woke = 0
  4:  blez  a1, 0x128         # n <= 0? straight out
  8:  or    v0, zero, zero    #   (slot) i = 0
  c:  andi  a3, a1, 0x3       # n & 3, the first step of the unroll
 10:  beqz  a3, 0x5c          # no remainder? main loop
 14:  or    t0, a3, zero      #   (slot) remainder trip count
 18:  sll   t6, zero, 2       # the useless sll, as expected
 1c:  addu  a2, a0, t6        # cursor = b
 20:  lbu   a3, 0(a2)         # ── remainder loop: flags
 24:  addiu v0, v0, 1         # i++
 28:  andi  t7, a3, 0x2       # awake bit
 2c:  bnez  t7, 0x50          # already awake? skip
 30:  nop
 34:  lh    t8, 2(a2)         # charge
 38:  ori   t9, a3, 0x2       # flags|2, staged early
 3c:  slti  at, t8, 51        # charge > 50, spelled K+1
 40:  bnez  at, 0x50          # too low? skip
 44:  nop
 48:  sb    t9, 0(a2)         # wake it
 4c:  addiu v1, v1, 1         # woke++
 50:  bne   t0, v0, 0x20      # remainder done?
 54:  addiu a2, a2, 4         #   (slot) cursor += sizeof(Bot)
 58:  beq   v0, a1, 0x128     # remainder was everything? out
 5c:  sll   t1, v0, 2         # ── main-loop setup: scale i, n
 60:  sll   t2, a1, 2
 64:  addu  t0, t2, a0        # end pointer
 68:  addu  a2, a0, t1        # cursor
 6c:  lbu   a3, 0(a2)         # ── main loop, element 0
 70:  andi  t3, a3, 0x2
 74:  bnezl t3, 0x9c          # awake? on to element 1…
 78:  lbu   v0, 4(a2)         #   (likely slot) preload ITS flags
 7c:  lh    t4, 2(a2)
 80:  ori   t5, a3, 0x2
 84:  slti  at, t4, 51
 88:  bnezl at, 0x9c
 8c:  lbu   v0, 4(a2)
 90:  sb    t5, 0(a2)
 94:  addiu v1, v1, 1
 98:  lbu   v0, 4(a2)         # (dup) element 1 begins
 9c:  andi  t6, v0, 0x2       # …same 12-line body, offsets +4
 a0:  bnezl t6, 0xc8
 a4:  lbu   v0, 8(a2)
 a8:  lh    t7, 6(a2)
 ac:  ori   t8, v0, 0x2
 b0:  slti  at, t7, 51
 b4:  bnezl at, 0xc8
 b8:  lbu   v0, 8(a2)
 bc:  sb    t8, 4(a2)
 c0:  addiu v1, v1, 1
 c4:  lbu   v0, 8(a2)         # element 2 begins
 c8:  andi  t9, v0, 0x2       # …offsets +8
 cc:  bnezl t9, 0xf4
 d0:  lbu   v0, 12(a2)
 d4:  lh    t1, 10(a2)
 d8:  ori   t2, v0, 0x2
 dc:  slti  at, t1, 51
 e0:  bnezl at, 0xf4
 e4:  lbu   v0, 12(a2)
 e8:  sb    t2, 8(a2)
 ec:  addiu v1, v1, 1
 f0:  lbu   v0, 12(a2)        # element 3 begins
 f4:  andi  t3, v0, 0x2       # …offsets +12, and the cursor bump
 f8:  bnezl t3, 0x120         #    hides in the skip slots now:
 fc:  addiu a2, a2, 16        #   (likely slot) cursor += 16
100:  lh    t4, 14(a2)
104:  ori   t5, v0, 0x2
108:  slti  at, t4, 51
10c:  bnezl at, 0x120
110:  addiu a2, a2, 16
114:  sb    t5, 12(a2)
118:  addiu v1, v1, 1
11c:  addiu a2, a2, 16
120:  bnel  a2, t0, 0x6c      # back-edge, likely form…
124:  lbu   a3, 0(a2)         #   (likely slot) next element 0's flags
128:  or    v0, v1, zero
12c:  jr    ra
130:  nop
```

Use this strategy to read it, instead of going line by line:

1. **Recognize the frame.** The guard, `andi n, 0x3`, the useless
   `sll`, the remainder loop, the scaled setup, the ×4 stanzas and the
   `bnel` back-edge are the unroll skeleton from the loops chapter. This
   time the body works on structs.
2. **Read ONE body.** The remainder loop (lines `0x20`-`0x54`) shows the
   logic for one element most clearly. It has the flag test, the
   short-circuit `&&` as two skips to the same label, the RMW that wakes
   the bot, and the count. Those twelve lines are the whole function.
3. **Check that the stanzas are copies.** The offsets step through
   0/4/8/12. When a stanza skips, the likely slot of its skip branch
   preloads the next element's flags. In the last stanza, the cursor
   bump moves into the slots of its skips. Nothing else changes.

The target, `func_800ce968`, is the same sweep with the condition
inverted in *both* clauses. It acts on entities whose flag bit **is**
set and whose stat has run out. It retires those entities and counts
them. Expect the flag test's branch to be flipped, the stat test to
become a `bgtzl` skip, and the RMW to *clear* the bit with a mask
instead of setting it. Reduce the listing to its twelve-line body and
write the plain loop. IDO will build the full unrolled listing from
that.

## Your task

Write `func_800ce968` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800ce968(Unit *m, s32 n) {
    s32 removed = 0;
    s32 i;
    for (i = 0; i < n; i++) {
        if ((m[i].flags & 1) != 0 && m[i].hp <= 0) {
            m[i].flags &= 0xFE;
            removed++;
        }
    }
    return removed;
}
```

<!-- context -->
```c
typedef struct {
    u8  flags;
    u8  pad;
    s16 hp;
} Unit;
```
