---
id: 6b509921-463d-4255-b0dc-71ff7c84ce86
slug: abi-nonleaf-frame
title: "Calling Out: The Minimal Stack Frame"
difficulty: 2
concepts:
  - abi
  - calls
  - frames
  - stack
symbol: func_802d4264
hints:
  - "The `jal` line names the function being called; yours needs to call it and hand its result straight back."
  - "Don't write any code for the frame — the prologue and epilogue appear on their own the moment your function contains a call."
---

# The first function that calls another

Everything you've matched so far has been a **leaf** — a function that calls
nobody. Leaves are cheap: they run entirely in registers and never touch `sp`.
The moment a function makes a call, that changes, because of how calls work on
MIPS.

`jal` — **j**ump **a**nd **l**ink — jumps to the callee and drops the address to
come back to into `ra`. That's the problem: your function's *own* return address
is already sitting in `ra`. One `jal` and it's gone. So a calling function must
save `ra` somewhere first — on the stack — and that means opening a **stack
frame**.

Here's `poke`, a function whose entire body is a call to `signalDone()`:

```asm
addiu  sp, sp, -24     # open a 24-byte frame (sp grows downward)
sw     ra, 20(sp)      # save our way home
jal    signalDone      # call — ra now points back *here*
nop                    # (delay slot: nothing useful to put in it)
lw     ra, 20(sp)      # restore our way home
addiu  sp, sp, 24      # close the frame
jr     ra
nop
```

Why 24 bytes for a function with no variables? The bottom 16 bytes (offsets
0–12) are the four reserved argument slots you keep hearing about — o32 makes
*every* caller provide them, even for a callee that takes no arguments. `ra`
goes above them at `20(sp)`, and the total is rounded up so `sp` stays 8-byte
aligned. This exact prologue/epilogue — `-24`, `ra` at 20 — is the minimal
non-leaf frame, and you will see it hundreds of times.

One more thing: `jal` is a jump, so it has a **delay slot**, and here the
compiler had nothing to schedule into it. A bare `nop` after `jal` is common;
soon you'll see that slot carrying real work.

The target calls a function that *returns* a value. There's no tail-call trick
on this compiler — the frame is built and torn down in full — and the callee's
result comes back in `v0`, which is exactly where your function's own return
value belongs. Watch how little code that takes.

## Your task

`extern s32 readSensor(void);` is already declared for you. Write `func_802d4264` to
reproduce the target assembly.

<!-- solution -->
```c
s32 func_802d4264(void) {
    return readSensor();
}
```

<!-- context -->
```c
extern s32 readSensor(void);
```
