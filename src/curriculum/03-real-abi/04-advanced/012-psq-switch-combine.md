---
id: advanced-psq-switch-combine
title: "Capstone II: Saved Floats Dispatched Through a Switch"
difficulty: 5
concepts:
  - paired-singles
  - psq_st
  - callee-save
  - switch
  - enum
  - chaining
symbol: combine
hints:
  - Several float results live across calls, so the prologue spills callee-saved
    FPRs as `stfd`/`psq_st` pairs and reloads them as `psq_l`/`lfd` in the epilogue.
  - After the last call, an enum `switch` selects which float combination to
    return — the per-case `fadds`/`fsubs`/`fmuls` blocks tell you each arm's expression.
---

# The float-heavy idiom meets dispatch

This is the chapter's second capstone, and it stacks two of its heaviest ideas.
First, holding several float results live across calls forces **callee-saved FPR
spills** — each one an `stfd`/`psq_st` pair in the prologue (lesson 3). Then an
**enum `switch`** (lessons 2 and 5) picks which combination of those saved floats
to return. The prologue is pure plumbing; the real shape is in the per-case
float blocks after the dispatch.

Consider `blend2(Kind k, f32 *v)`: it runs `fx` on three inputs, holding the
results live, then switches on a three-value `Kind` enum to combine them:

```asm
stwu   r1, -48(r1)
stfd   f31, 32(r1)        # callee-save spill: f31 as a double...
psq_st f31, 40(r1), 0, 0  # ...and as a paired-single
stfd   f30, 16(r1)
psq_st f30, 24(r1), 0, 0
...
fmr    f30, f1            # first fx result parked in a saved FPR
...                       # (two more calls, results in f31 / f1)
cmpwi  r30, 1             # switch on k (saved in r30): the density rule again
beq-   .sub
bge-   .hi
cmpwi  r30, 0
...
.add: fadds f0, f30, f31  fadds f1, f1, f0  b .epi   # K_ADD arm
.sub: fsubs f0, f30, f31  fsubs f1, f0, f1  b .epi   # K_SUB arm
.mul: fmuls f0, f30, f31  fmuls f1, f1, f0  b .epi   # K_MUL arm
.epi: psq_l f31, 40(r1), 0, 0  lfd f31, 32(r1)       # mirror restore
```

Three things to read in order. The **prologue** `stfd`/`psq_st` pairs (and the
mirrored `psq_l`/`lfd` epilogue) just mean the function kept float values across
calls — they fall out automatically; you don't write them. The **dispatch**
(`cmpwi r30, K` / `beq-` / `bge-`) is the enum switch on the first argument,
parked in a callee-saved GPR because it must survive the calls too. The **case
blocks** are the payload: each one's `fadds`/`fsubs`/`fmuls` sequence is one
arm's float expression — read which saved FPRs feed it to recover the formula.

## Your task

Write `combine(Op op, f32 *p)` to reproduce the assembly above. The `Op` enum and
`extern f32 transform(f32)` are provided in context. Call `transform` on
`p[0]..p[3]`, hold the results live, and `switch (op)` to pick the combination —
read each case's `fadds`/`fsubs`/`fmuls`/`fmadds` block to recover that arm's
expression, and let the callee-saved FPR spills fall out on their own.

<!-- starter -->
```c
f32 combine(Op op, f32 *p) {
    return 0.0f;
}
```

<!-- solution -->
```c
f32 combine(Op op, f32 *p) {
    f32 a = transform(p[0]);
    f32 b = transform(p[1]);
    f32 c = transform(p[2]);
    f32 d = transform(p[3]);
    switch (op) {
        case OP_SUM:  return a + b + c + d;
        case OP_DIFF: return a - b + c - d;
        case OP_PROD: return a * b * c * d;
        case OP_MIX:  return a * b + c * d;
        default:      return 0.0f;
    }
}
```

<!-- context -->
```c
extern f32 transform(f32);
typedef enum { OP_SUM, OP_DIFF, OP_PROD, OP_MIX } Op;
```
