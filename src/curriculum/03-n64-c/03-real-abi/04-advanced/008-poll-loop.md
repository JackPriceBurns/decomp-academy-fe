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
  - "Compare the branch conditions with the worked example. Both of them are flipped. Waiting *until* a bit is set is the same as waiting *while* it is clear."
  - "The `andi` mask tells you which bit. An empty loop body in C produces the whole rotated loop."
---

# The loop that waits

Hardware polling is one of the oldest patterns in console code. The code reads
a status register, tests a bit, and repeats until the bit changes. In C it is
a `while` loop with an **empty body**, and all the work is in the condition.
Here is `waitReady()`, which loops as long as bit 0 of the volatile `gStatus`
is set:

```asm
 0:  lui    v0, %hi(gStatus)
 4:  addiu  v0, v0, %lo(gStatus)
 8:  lw     t6, 0(v0)         # first read
 c:  andi   t7, t6, 0x1       # test bit 0
10:  beqz   t7, 0x28          # already clear? never enter the loop
14:  nop
18:  lw     t8, 0(v0)         # ── the spin ──
1c:  andi   t9, t8, 0x1
20:  bnezl  t9, 0x1c          # still set? go around again: likely form…
24:  lw     t8, 0(v0)         #   …with the RELOAD in the slot
28:  jr     ra
2c:  nop
```

This listing uses several things you have learned in this tier:

- **Volatile keeps every load.** Without it, the compiler would read the
  value once and then loop forever on a copy in a register. The loop only
  works because each test loads the value from the address again.
- **The condition is tested in two places in the listing:** once before the
  loop (`0x8` to `0x10`) and once at the bottom. This is the same loop
  rotation you have seen since the first `for`: a guard on entry and a test
  at the bottom.
- **The `bnezl` jumps to `0x1c`, one instruction after the `lw` at
  `0x18`.** The branch's likely slot holds the *next* read. So when the
  branch is taken, the value has already been loaded again, and the loop
  continues at the `andi`. The load has moved into the branch's delay slot,
  so the loop is two instructions with the load in the slot.

Your C for all of this is a `while` whose body is `{}`. Do not add statements
to "generate" the loads. The global appears once in the condition, and that
becomes one load *per test*. The loop rotation then copies that load.

The target waits for the opposite condition on a different bit. Read its two
branch conditions and its mask, then write it in one line.

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
