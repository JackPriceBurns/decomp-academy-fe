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
  - The register named in the thunk is where the address ended up. The `mov`s
    before it move the arguments down into place.
  - The function pointer is the first parameter, so it has to move out of `r0`
    before the real arguments can be loaded into `r0` and `r1`.
---

# Calling an address held in a register

Thumb-1 has no `blx rM`, so no instruction can call the address in a register
and come back in Thumb state. With `-mthumb-interwork`, gcc works around this
by calling a small library thunk instead. There is one thunk per register,
named after the register it jumps through:

```asm
0        push      {lr}
2        bl        _call_via_r0-4
6        pop       {r0}
8        bx        r0
```

`bl _call_via_r0` means "the address is in `r0`; go there and return here".
The name carries all of the information. No other operand tells you which
register held the pointer. These four instructions show three more details.
First, `bl` is a 32-bit instruction, so the address column steps from 2 to 6
instead of to 4. Second, the `-4` attached to the name is how the workspace
shows a Thumb `bl` relocation. It is not an offset you write. Third, the
`push {lr}` is there because any call overwrites the link register.

The register shuffle before the call is the important part. The pointer arrives
in an argument register. The call it is about to make needs its arguments in
those same registers, starting from `r0`. So the pointer has to move out of the
way first:

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

This calls the same function twice, and passes the first result to the second
call. The pointer has to stay live across a call, so it goes to `r4`, which is
callee-saved, and the thunk name changes to match. The value moves from `r1`
down into `r0`. The second call then needs no setup at all, because the result
of the first call is already in `r0`, which is where the argument goes.

Read the shuffle backwards to work out the call. If the pointer is moved to a
high or callee-saved register, it is still needed after the call. The `mov`s
into `r0`, `r1`, `r2` tell you how many arguments are passed.

Your target moves more registers than this one before it makes the call.

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
