---
id: 6b509921-463d-4255-b0dc-71ff7c84ce86
slug: abi-nonleaf-frame
title: "Making a Call: The Minimal Stack Frame"
difficulty: 2
concepts:
  - abi
  - calls
  - frames
  - stack
symbol: func_802d4264
hints:
  - "The `jal` line names the function being called. Your function needs to call it and return its result directly."
  - "Don't write any code for the frame. The compiler adds the prologue and epilogue by itself as soon as your function contains a call."
---

# The first function that calls another

Everything you have matched so far has been a **leaf**: a function that does
not call any other function. Leaves are cheap. They run entirely in registers
and never touch `sp`. That changes as soon as a function makes a call, because
of how calls work on MIPS.

`jal` (**j**ump **a**nd **l**ink) jumps to the callee and puts the address to
return to in `ra`. Your function's *own* return address is already in `ra`, so
a single `jal` overwrites it. A function that makes a call must therefore save
`ra` somewhere first. It saves it on the stack, and that means opening a
**stack frame**.

This is `poke`, a function whose entire body is a call to `signalDone()`:

```asm
addiu  sp, sp, -24     # open a 24-byte frame (sp grows downward)
sw     ra, 20(sp)      # save the return address
jal    signalDone      # call: ra now points back into poke
nop                    # (delay slot: nothing useful to put in it)
lw     ra, 20(sp)      # restore the return address
addiu  sp, sp, 24      # close the frame
jr     ra
nop
```

The frame is 24 bytes even though the function has no variables. The bottom 16
bytes (offsets 0 through 12) are the four reserved argument slots that earlier
lessons mentioned. The o32 rules make *every* caller provide them, even for a
callee that takes no arguments. `ra` goes above them at `20(sp)`, and the total
is rounded up so `sp` stays 8-byte aligned. This exact prologue and epilogue
(`-24`, with `ra` at 20) is the minimal non-leaf frame, and you will see it
hundreds of times.

`jal` is a jump, so it also has a **delay slot**. Here the compiler had nothing
to put in it. A plain `nop` after `jal` is common. Soon you will see that slot
used for real work.

The target calls a function that *returns* a value. This compiler does not
optimize tail calls, so the frame is built and removed in full. The callee's
result comes back in `v0`, which is exactly where your function's own return
value goes. Notice how little code that takes.

## Your task

`extern s32 readSensor(void);` is already declared for you. Write
`func_802d4264` to reproduce the target assembly.

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
