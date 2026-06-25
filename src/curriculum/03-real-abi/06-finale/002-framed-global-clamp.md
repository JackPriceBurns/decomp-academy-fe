---
id: finale-real-framed-global-clamp
title: "Call, Read a Global, Clamp"
difficulty: 4
concepts:
  - finale
  - stack-frame
  - globals
  - sda21
  - clamp
  - control
symbol: clampedStep
hints:
  - The `bl` makes this a non-leaf, so a full `stwu`/`mflr`/`stw` prologue and its
    mirror wrap the real work — read past the boilerplate.
  - The returned value and the `@sda21` global are combined first; the `li` of the
    bound is parked speculatively before the `cmpwi`.
  - "The cap is delivered the `bgt-` way: a speculative `li` of the limit, with
    `mr` letting the computed value through when it stays under."
---

# A frame, a global, and a guard in one body

This is the texture of ordinary engine code: a function calls a helper, blends
the result with some global state, and keeps the answer in range. Three chapters
show up at once — the **stack frame** of the ABI chapter (the call forces a
prologue/epilogue), an **`@sda21` global read** from the globals chapter, and a
one-sided **clamp** that the optimizer keeps as a real branch.

Read it in layers. The outer shell is prologue/epilogue boilerplate around a
single `bl`. Inside, the value coming back in `r3` is combined with a global, and
then a speculative-`li` clamp caps it. Consider `cappedStep`, which calls
`sample`, subtracts a global bias, and holds the result under 1000:

```asm
stwu  r1,-16(r1)            # PROLOGUE — the call makes this non-leaf
mflr  r0
stw   r0,20(r1)
bl    sample               # sample(x), result in r3
lwz   r4,gBias@sda21(r13)    # read the int global gBias
li    r0,1000              # speculative: the ceiling
subf  r3,r4,r3             # r3 = sample(x) - gBias
cmpwi r3,1000              # over the cap?
bgt-  .done                # yes -> keep r0 (= 1000)
mr    r0,r3                # no  -> pass the computed value through
.done:
mr    r3,r0
lwz   r0,20(r1)            # EPILOGUE
mtlr  r0
addi  r1,r1,16
blr
```

The middle four instructions are the whole job: one `@sda21` load, the arithmetic
that joins the call result to the global, and the `li`/`cmpwi`/`bgt-`/`mr` clamp.
The `li 1000` lands in the return register *before* the compare so the over-limit
path costs nothing extra; `mr` overwrites it only when the value is in range.

Your `clampedStep` has the same three-layer shape, but it **adds** the global
instead of subtracting it and caps at a **different** bound. Read the opcode that
joins the call result to the global, and read the `cmpwi`/`bgt-` pair for the
limit and direction.

## Your task

`compute` is declared for you, along with the int global `gThreshold`. Write
`clampedStep`, taking one `int`, to reproduce the assembly above. Expect a full
prologue and epilogue around the `bl`; the real work is the load, the arithmetic,
and the clamp in the middle.

<!-- starter -->
```c
int clampedStep(int x) {
    return 0;
}
```

<!-- solution -->
```c
int clampedStep(int x) {
    int v = compute(x) + gThreshold;
    if (v > 255) return 255;
    return v;
}
```

<!-- context -->
```c
extern int compute(int x);
extern int gThreshold;
```
