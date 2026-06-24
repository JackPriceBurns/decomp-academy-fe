---
id: abi-stack-frame
title: The Stack Frame and the Link Register
difficulty: 2
concepts:
  - stack-frame
  - prologue
  - epilogue
  - link-register
  - calls
symbol: wrapper
hints:
  - Calling `compute` makes this a non-leaf, so it needs a stack frame.
  - Look for `stwu r1,-16(r1)` / `mflr` / `stw r0,20(r1)` on entry and the
    mirror on exit, with `addi r3,r3,1` after the `bl`.
---

# What it costs to call another function

The moment a function **calls** something, its shape changes completely. A call
(`bl`) overwrites the **link register** `lr` with the address to come back to —
so before our function can call out, it must save its *own* return address
somewhere safe. That somewhere is a **stack frame**.

Consider `frame_ex(s32 x) { return process(x) - 5; }`:

```asm
stwu   r1,-16(r1)   # PROLOGUE: push a 16-byte frame (r1 is the stack pointer)
mflr   r0           # r0 = our return address (the link register)
stw    r0,20(r1)    # save it into the caller's frame, above our own
bl     process      # call process(x) — this trashes lr, but we saved it
lwz    r0,20(r1)    # EPILOGUE: reload our return address
addi   r3,r3,-5     # adjust the return value
mtlr   r0           # restore lr
addi   r1,r1,16     # pop the frame
blr                 # return
```

Every non-leaf function wears this prologue/epilogue. `stwu r1, -N(r1)` both
allocates the frame and links it to the caller's; `mflr`/`stw` save the return
address on the way in; `lwz`/`mtlr`/`addi r1` undo it all on the way out. Learn
to read past this boilerplate to find the real work in the middle.

After `stwu r1, -16(r1)`, the new `r1` points 16 bytes below where it started,
and the frame is laid out like this:

```text
20(r1)  LR save slot (in the caller's frame)  <- our return address goes here
16(r1)  caller's back-chain word
12(r1)  saved-register slot (used in later lessons)
 8(r1)  parameter area
 4(r1)  our own LR save slot (unused — leaf callees fill it)
 0(r1)  back-chain: points at the old r1 (= r1 + 16)
```

That is why the return address is stored at `20(r1)`: it lives in the *caller's*
LR save slot, which sits `16 + 4` bytes above our new stack pointer.

Now look at the target assembly for `wrapper`. The prologue and epilogue match
the pattern above exactly. Focus on the instruction between the `bl` and the
`lwz` — that is the only real work.

## Your task

Write `wrapper`, which calls `compute(x)` and returns a value derived from the
result. `compute` is declared for you. Expect a full prologue and epilogue around the
`bl`.

<!-- starter -->
```c
int wrapper(int x) {
    return 0;
}
```

<!-- solution -->
```c
int wrapper(int x) {
    return compute(x) + 1;
}
```

<!-- context -->
```c
extern int compute(int x);
```
