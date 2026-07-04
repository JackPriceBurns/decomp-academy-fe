---
id: 59bfe954-f3cd-5e05-90c3-aceb43694348
slug: abi-stack-frame
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

Call out to another function and the whole shape of yours changes. The culprit is
`bl`. It overwrites the link register `lr` with wherever execution resumes next —
but `lr` was already holding the return address handed to *us*, and losing that
strands us from our own caller. So the first job is to stash it somewhere that
survives the call. Somewhere being a stack frame.

Here's `frame_ex(s32 x) { return process(x) - 5; }`:

```asm
stwu   r1,-16(r1)   # PROLOGUE: push a 16-byte frame (r1 is the stack pointer)
mflr   r0           # r0 = our return address (the link register)
stw    r0,20(r1)    # save it into the caller's frame, above our own
bl     process      # call process(x) — this trashes lr, but we saved it
lwz    r0,20(r1)    # EPILOGUE: reload our return address
subi   r3,r3,5      # adjust the return value
mtlr   r0           # restore lr
addi   r1,r1,16     # pop the frame
blr                 # return
```

Every non-leaf function wears the same prologue and epilogue. `stwu r1, -N(r1)`
pulls double duty, opening the frame and chaining it back to the caller's. `mflr`
and `stw` hide the return address on the way in; `lwz`, `mtlr`, and `addi r1`
unwind it on the way out. None of it is the point of the function, so the trick is
skimming past it to the real work in the middle.

Where does the frame land? After `stwu r1, -16(r1)`, `r1` sits 16 bytes lower than
before, and the slots lay out this way:

```text
20(r1)  LR save slot (in the caller's frame)  <- our return address goes here
16(r1)  caller's back-chain word
12(r1)  saved-register slot (used in later lessons)
 8(r1)  parameter area
 4(r1)  our own LR save slot (unused — leaf callees fill it)
 0(r1)  back-chain: points at the old r1 (= r1 + 16)
```

Notice the return address at `20(r1)`. That slot isn't ours — it lives in the
*caller's* frame, `16 + 4` bytes above the stack pointer we just dropped.

`wrapper` reuses this prologue and epilogue verbatim, so ignore them. The only
instruction doing real work is the one caught between the `bl` and the `lwz`.

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
