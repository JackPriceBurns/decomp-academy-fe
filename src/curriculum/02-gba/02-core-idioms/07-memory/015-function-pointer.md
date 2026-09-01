---
id: 38a9793d-7c2c-49a2-913f-d749188a2f74
slug: gba-memory-function-pointer
title: Calling Through a Pointer
difficulty: 4
concepts:
  - function-pointers
  - calling-convention
  - interworking
symbol: func_08233bc4
hints:
  - The register named in the thunk is where the address ended up, and the
    `mov`s in front of it are the arguments sliding down into place.
  - The function pointer is the first parameter, so it has to vacate `r0`
    before the real arguments can be loaded into `r0` and `r1`.
---

# Calling an address held in a register

Thumb-1 has no `blx rM`, so there is no instruction that calls the address in a
register and comes back in Thumb state. With `-mthumb-interwork` gcc gets
around it by calling a tiny library thunk instead, one per register, named
after the register it dispatches through:

```asm
0        push      {lr}
2        bl        _call_via_r0-4
6        pop       {r0}
8        bx        r0
```

`bl _call_via_r0` means "the address is in `r0`; go there and return here".
The name is the entire convention — no other operand tells you where the
pointer was. Three details in four instructions: `bl` is a 32-bit instruction,
so the address column steps from 2 to 6 rather than to 4; the `-4` glued to the
name is how the workspace renders a Thumb `bl` relocation, not an offset you
write; and the `push {lr}` is there because any call at all clobbers the link
register.

The interesting part is the register shuffle in front of the call. The pointer
arrives in an argument register, and the arguments to the call it is about to
make want those same registers starting from `r0`, so the pointer has to get
out of the way first:

```asm
0        push      {r4, lr}
2        mov       r4, r0
4        mov       r0, r1
6        bl        _call_via_r4-4
10       bl        _call_via_r4-4
14       pop       {r4}
16       pop       {r1}
18       bx        r1
```

This calls the same function twice, feeding the first result into the second.
The pointer has to survive a call, so it goes to `r4`, which is callee-saved,
and the thunk name changes to match. The value moves from `r1` down into `r0`.
The second call then needs no setup whatsoever: the result of the first is
already sitting in `r0`, which is exactly where the argument goes.

Read the shuffle backwards and it gives you the call. A pointer parked in a
high or callee-saved register means it outlives the call; the `mov`s into `r0`,
`r1`, `r2` count the arguments being passed.

Your target moves more registers than this one before it dispatches.

## Your task

Write `func_08233bc4` to reproduce the target assembly.

<!-- context -->
```c
typedef s32 (*IntPairFn)(s32, s32);
```

<!-- solution -->
```c
s32 func_08233bc4(IntPairFn f, s32 a, s32 b) {
    return f(a, b) * 2;
}
```
