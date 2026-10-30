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
  - r4 holds the global's address for the whole function. The `ldr` through r4
    loads the variable's value, and the `str` through r4 writes the same
    variable back.
  - "`void func_083edba0(s32 delta)` is the signature, and the body is a single
    statement that assigns to `gHitPoints`."
---

# Keeping a global's address across a call

Reading a global takes two loads. The first loads the global's address from the
literal pool. The second loads the value stored at that address. When there is
a `bl` between the two loads, the compiler treats them differently.

The address is a constant that is fixed when the program is linked. Nothing a
callee does can change where `gHitPoints` is stored, so the compiler can load
the pool word once and keep it. The address has to survive the call, so the
compiler keeps it in a callee-saved register. That is why a function that uses
one global around one call starts with `push {r4, lr}`.

The value does not get the same treatment. A `bl` runs code the compiler cannot
see, and that code may write to any global. So if the variable is read after
the call, the compiler has to load it from memory again.

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

There is one pool word, and both accesses to the variable use the register it
was loaded into. The `ldr r4` at address 2 is moved above the call, so it runs
only once. The `ldr r1, [r4, #0]` at address 8 loads the global's value. It
runs after the call, so it sees any change that `drain` made. The `str` at
address 12 writes the result back through the same base register.

In the C, `gEnergy` comes before `drain(n)`, but the compiler still reads the
global second. Within one expression, gcc chooses the order in which it
evaluates the two operands. It prefers to make the call first, so that it does
not have to keep a value alive across the call. If you read the global into its
own named temporary first, the load does move above the `bl`. The cost is a
second callee-saved register to hold the value while the call runs. The store
is the only part whose position is fixed.

The `pop {r0}` shows that this function returns nothing. The compiler could use
r0 to carry the return address because r0 held no return value.

Your target loads its global before the `bl`, and it still pushes only r4. A
value that had to survive the call would need a saved register of its own. So
this value is used to build what goes into the call. Read the two instructions
between the pool load and the `bl`, and work out what is passed to `clampHp`.

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
