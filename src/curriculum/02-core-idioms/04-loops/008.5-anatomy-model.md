---
id: loops-anatomy-model
title: "A Mental Model: The Five Parts of a Loop"
difficulty: 2
concepts:
  - control-flow
  - break
  - continue
  - mental-model
concept: true
---

# One model for every loop

The earlier lessons matched specific `for`/`while`/`do` loops. Once you've seen a
few, it pays to carry a single mental model: **any** compiled loop decomposes
into the same five labelled regions. Name them and a wall of branches turns into
a flowchart.

- **`pre_loop`** — runs once before the loop: initialise the induction variable,
  then (for a pre-tested loop) an unconditional `b loop_cond` so the condition is
  checked *before* the first body.
- **`loop_body`** — the work. This is where `break` and `continue` originate.
- **`loop_incrementer`** — where the induction variable advances. A `for` loop
  has one; a `while`/`do` folds the step into the body.
- **`loop_cond`** — the test plus the backward branch to `loop_body`.
- **`post_loop`** — the first instruction *after* the loop: control lands here
  when the condition finally fails, or when a `break` jumps out.

## Read the wiring straight from the asm

You don't need the source to find the five regions — the branches themselves
give them away. There are only four connections to trace:

- **`pre_loop` branches to `loop_cond`.** That leading unconditional `b` is the
  jump-to-test, so it points straight at the condition.
- **`loop_body` falls through into `loop_incrementer`.** No branch between them;
  the body runs off its bottom edge into the step.
- **`loop_incrementer` falls through into `loop_cond`.** The step runs off its
  bottom edge into the test.
- **`loop_cond` branches back to `loop_body` when the condition holds, and falls
  through into `post_loop` when it fails.** That conditional branch is your
  anchor: its target is the top of the body, the instruction after it is
  `post_loop`.

So the recipe is mechanical. Find the **backward conditional branch** first — its
target is `loop_body`. Trace the unconditional `b` that jumps *into* the test to
find `pre_loop`. Everything the condition reads is `loop_cond`, and the
fall-through past it is `post_loop`. Label those once and the rest of the function
is just straight-line code wrapped around them.

## break and continue are just branches

```asm
loop_body:
    cmpwi r3, 0
    bne-  skip_continue
    b     loop_incrementer   # 'continue' -> jump to the step, then re-test
skip_continue:
    cmpwi r3, 2
    bne-  skip_break
    b     post_loop          # 'break' -> leave the loop entirely
skip_break:
    ...
```

A **`continue`** branches forward to `loop_incrementer` (in a `for`) or straight
to `loop_cond` (in a `while`); a **`break`** branches to `post_loop`. That's the
whole trick — once you can label the five regions, every `break`/`continue`
target is obvious.

## The three forms differ only in wiring

- **`do/while`** — no jump-to-test in `pre_loop`; the body always runs once, then
  `loop_cond` at the bottom decides whether to repeat. The simplest shape.
- **`while`** — `pre_loop` adds the leading `b loop_cond` so a zero-iteration case
  is handled; `continue` targets `loop_cond`.
- **`for`** — same as `while` but with a distinct `loop_incrementer`; `continue`
  now targets the incrementer, *not* the condition.

## The count-register variant

When the compiler can precompute the trip count, it may track it in the **count
register** and merge `loop_incrementer` and `loop_cond` into a single
**`bdnz`** ("branch if decremented CTR is not zero"). The explicit compare
disappears, which is why Ghidra and IDA often mis-label these as an
`if`-guarded `do/while` — but it's still just the same five-part loop with two
of its parts fused into one instruction.

## A worked example: recovering a compound condition

Labelling isn't busywork — it's often the *entire* insight that makes a function
match. Here is a real loop (a `find_if`-style scan), prologue and epilogue
stripped, with the five regions written in:

```asm
        b       loop_cond        # pre_loop: p = mKillers.begin(); jump to test
loop_incrementer:
        addi    r30, r30, 4      #   p++
loop_cond:
        cmplw   r30, r29         #   p != end ?
        beq     post_loop        #     equal -> leave the loop     (clause A fails)
        mr      r12, r31
        lwz     r3, 0(r30)       #   load *p
        mtctr   r12
        bctrl                    #   call isDead(*p)
        cmpwi   r3, 0
        bne+    loop_incrementer #   isDead -> go round again       (clause B holds)
post_loop:
        subf    r3, r30, r29     # p - end
```

`loop_body` is empty here, so the `bne+` jumps straight to `loop_incrementer`. The
payoff is in reading the **condition** off the labels. Notice `loop_cond` leaves
the loop in *two* places: the `beq post_loop` near the top, and the fall-through
after `bne+` at the bottom. Two exits out of one test means two clauses joined
with `&&` — the loop keeps going only while `p != end` **and** `isDead(*p)`:

```cpp
// real game code is often C++, but the labelling technique is identical
for (p = mKillers.begin(); p != end && isDead(*p); p++) {}
return p != end;
```

Miss that the test is compound and you reach for the obvious-looking shape
instead — a plain `p != end` loop with the `isDead` check as an `if (...) break;`
inside the body. It *looks* equivalent, but it reorders the compare and the call
and re-tests `p != end` in a different spot, so it doesn't match. On a real GC
function that single insight — that `loop_cond` held both clauses — was the
difference between a **76%** attempt and a **97%** one. The labels did the work:
once you've circled `loop_cond`, every branch leaving it is a clause of the `&&`.

There's no exercise here — keep the five-part map in your head and the next time
a loop's control flow looks like spaghetti, label the regions first.
