---
id: e700939d-9d79-4b64-a638-3c3be0caa3f6
slug: gba-realfinale-global-call
title: A Global Across a Call
difficulty: 3
concepts:
  - globals
  - literal-pool
  - calls
symbol: func_083edba0
hints:
  - r4 holds the global's address for the whole function. The `ldr` through it
    is the variable's value and the `str` through it is the same variable being
    written back.
  - "`void func_083edba0(s32 delta)` is the signature, and the body is a single
    statement that assigns to `gHitPoints`."
---

# The address survives, the value does not

Reading a global costs two loads: one to fetch its address out of the literal
pool, one to fetch the contents of that address. Put a `bl` in the middle of
that and the two loads part company.

The address is a link-time constant. Nothing a callee does can change where
`gHitPoints` lives, so the compiler is free to load the pool word once and keep
it — and because it has to survive a call, it keeps it in a callee-saved
register, which is why a function that touches one global around one call opens
with `push {r4, lr}`.

The contents get no such treatment. A `bl` runs code the compiler cannot see,
and that code may write any global it likes, so a read of the variable after
the call has to go back to memory.

Here is `spendEnergy`, which subtracts `drain(n)` from the global `gEnergy`:

```asm
0        push      {r4, lr}
2        ldr       r4, [pc, #16] (->20)
4        bl        drain-4
8        ldr       r1, [r4, #0]
10       sub       r1, r0
12       str       r1, [r4, #0]
14       pop       {r4}
16       pop       {r0}
18       bx        r0
20       .word     gEnergy
```

One pool word, and both accesses to the variable go through the register it
landed in. The `ldr r4` at address 2 is hoisted above the call so it is paid
for once. The `ldr r1, [r4, #0]` at address 8 is the global's value, fetched
after `drain` has had its chance to change it. The `str` at address 12 writes
the result back through the same base register.

The C names `gEnergy` before it names `drain(n)`, and the compiler still reads
the global second. Within one expression the order of the two operands is gcc's
to choose, and it would rather call first than keep a value alive across the
call. Pulling the read out into its own named temporary does move the load
above the `bl`, and costs a second callee-saved register to hold the value
while the call runs. The store is the only part pinned in place.

The `pop {r0}` says this one returns nothing: r0 was free to carry the return
address because no return value was sitting in it.

Your target loads its global before the `bl`, and still pushes only r4. A value
that had to survive the call would want a saved register of its own, so this one
is going into the call. Read the two instructions between the pool load and the
`bl`, and work out what `clampHp` is being handed.

## Your task

Write `func_083edba0` to reproduce the target assembly.

<!-- context -->
```c
extern s32 gHitPoints;
extern s32 clampHp(s32 v);
```

<!-- solution -->
```c
void func_083edba0(s32 delta) {
    gHitPoints = clampHp(gHitPoints + delta);
}
```
