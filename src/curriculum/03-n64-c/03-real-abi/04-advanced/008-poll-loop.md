---
id: bd9e30e7-2121-4e3e-9d97-50413f8507ed
slug: adv-poll-loop
title: Spinning on Hardware
difficulty: 4
concepts:
  - volatile
  - loops
  - branch-likely
  - hardware
symbol: func_803678c0
hints:
  - "Compare the branch conditions against the worked example — both of them flipped. Waiting *until* a bit is set is waiting *while* it is clear."
  - "The `andi` mask names the bit. An empty loop body in C produces the whole rotated shape."
---

# The loop that waits

Hardware polling is one of the oldest patterns in console code: read a status
register, test a bit, and go around again until it changes. In C it's a
`while` with an **empty body** — all the action is in the condition. Here's
`waitReady()`, which spins as long as bit 0 of the volatile `gStatus` is set:

```asm
 0:  lui    v0, %hi(gStatus)
 4:  addiu  v0, v0, %lo(gStatus)
 8:  lw     t6, 0(v0)         # first read
 c:  andi   t7, t6, 0x1       # test bit 0
10:  beqz   t7, 0x28          # already clear? never enter the loop
14:  nop
18:  lw     t8, 0(v0)         # ── the spin ──
1c:  andi   t9, t8, 0x1
20:  bnezl  t9, 0x1c          # still set? around again — likely form…
24:  lw     t8, 0(v0)         #   …with the RELOAD riding the slot
28:  jr     ra
2c:  nop
```

Everything you've learned this tier meets here:

- **Volatile keeps every load real.** Without it, the compiler would read
  once and spin forever on a register copy — the loop only works because
  each test reloads from the address.
- **The condition is tested twice in the listing** — once before the loop
  (`0x8`–`0x10`) and once at the bottom. That's the same loop rotation you've
  seen since the first `for`: guard on entry, test at the bottom.
- **The `bnezl` targets `0x1c`, not `0x18`.** Look closely: the branch's
  likely slot holds the *next* read, so a taken branch has already reloaded
  and re-enters at the `andi`. The load has been folded into the branch
  itself — two-instruction spin, load in the shadow.

Your C for all of this is a `while` whose body is `{}`. Resist inventing
statements to "generate" the loads; the condition's single mention of the
global becomes one load *per test*, and the rotation duplicates it.

The target waits for the opposite reason on a different bit. Read its two
branch conditions and its mask, then say it in one line.

## Your task

`extern vu32 gReady;` is declared for you. Write `func_803678c0` to reproduce
the target assembly.

<!-- solution -->
```c
void func_803678c0(void) {
    while (!(gReady & 2)) {}
}
```

<!-- context -->
```c
extern vu32 gReady;
```
