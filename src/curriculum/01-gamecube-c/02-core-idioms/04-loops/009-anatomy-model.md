---
id: c7706205-4c08-5c0a-9f74-b6af369d8cb7
slug: loops-anatomy-model
title: "A Mental Model: The Five Parts of a Loop"
difficulty: 2
concepts:
  - control-flow
  - break
  - continue
  - mental-model
concept: true
---

# The five-part shape every loop takes

I used to match `for`, `while`, and `do` loops one shape at a time, like they
were unrelated puzzles. They're not. After enough of them it finally clicked for
me: **any** compiled loop is the same five labelled regions wearing different
clothes. Name them, and what looked like a wall of branches turns into a plain
flowchart.

- **`pre_loop`** is the warm-up. It runs once, sets up the induction variable,
  and in a pre-tested loop it drops an unconditional `b loop_cond` so the test
  fires *before* the first body.
- **`loop_body`** does the actual work. It's also where `break` and `continue`
  are born.
- **`loop_incrementer`** is the step. A `for` keeps it separate; a `while` or
  `do` just folds it into the body.
- **`loop_cond`** is the test plus the backward branch back up to `loop_body`.
- **`post_loop`** is wherever you land when it's all over, either the condition
  finally failed or a `break` bailed you out.

## Read the wiring straight from the asm

Here's the part I love: you don't need the source at all. The branches give the
regions away. Trace four connections and you're done.

- **`pre_loop` branches to `loop_cond`.** That leading unconditional `b` is the
  jump-to-test, pointing dead at the condition.
- **`loop_body` falls through into `loop_incrementer`.** Nothing branches between
  them. The body just spills off its bottom edge into the step.
- **`loop_incrementer` falls through into `loop_cond`.** Same story, the step
  pours off its bottom edge into the test.
- **`loop_cond` branches back to `loop_body` while the condition holds, and falls
  through into `post_loop` when it fails.** This one's your anchor. Its target is
  the top of the body, and whatever sits right after it is `post_loop`.

From there it's mechanical, almost boring. Find the **backward conditional
branch** first, because its target is `loop_body`. Chase the unconditional `b`
that leaps *into* the test and there's your `pre_loop`. Anything the condition
reads is `loop_cond`, and the fall-through past it is `post_loop`. Nail those down
and everything else is just straight-line code wrapped around them.

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

Now `continue` and `break` stop being scary. A **`continue`** jumps forward to
`loop_incrementer` in a `for`, or straight to `loop_cond` in a `while`. A
**`break`** jumps to `post_loop`. That's all there is to it. Once the five
regions are labelled, every `break`/`continue` target just falls out.

## The three forms differ only in wiring

- **`do/while`** drops the jump-to-test, so the body always runs once and
  `loop_cond` at the bottom decides whether to go again. Simplest of the lot.
- **`while`** puts that leading `b loop_cond` back so an empty run is handled, and
  `continue` points at `loop_cond`.
- **`for`** is the same as `while`, just with its own `loop_incrementer`, so now
  `continue` lands on the incrementer, *not* the condition.

## The count-register variant

There's one variant that trips people up. When the compiler already knows the
trip count, it parks the number in the **count register** and fuses
`loop_incrementer` and `loop_cond` into a single **`bdnz`** ("branch if
decremented CTR is not zero"). The explicit compare just disappears. That's why
Ghidra and IDA so often mis-read these as an `if`-guarded `do/while`. Don't be
fooled. It's still the same five-part loop, only with two parts welded into one
instruction.

## A worked example: recovering a compound condition

Labelling isn't busywork. More than once it's been the *whole* insight that got a
function to match for me. Take this real loop, a `find_if`-style scan, prologue
and epilogue stripped, with the five regions already pencilled in:

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

Notice `loop_body` is empty, so the `bne+` jumps straight to `loop_incrementer`.
The payoff is reading the **condition** off those labels. Look where `loop_cond`
actually leaves the loop, in *two* spots: the `beq post_loop` near the top and the
fall-through after the `bne+` at the bottom. Two exits from one test is two
clauses joined by `&&`, so the loop runs only while `p != end` **and**
`isDead(*p)`:

```cpp
// real game code is often C++, but the labelling technique is identical
for (p = mKillers.begin(); p != end && isDead(*p); p++) {}
return p != end;
```

Miss the compound test and you'll reach for the obvious shape instead, a plain
`p != end` loop with the `isDead` check tucked inside as an `if (...) break;`. It
*looks* the same. It isn't. It reorders the compare and the call and re-tests
`p != end` in the wrong place, so it won't match. On a real GC function, spotting
that `loop_cond` held both clauses was the difference between a **76%** attempt
and a **97%** one. The labels did the heavy lifting. Circle `loop_cond`, and every
branch leaving it is a clause of the `&&`.

No exercise this time. Carry the five-part map around in your head, and the next
time a loop's control flow looks like spaghetti, label the regions before you do
anything else.
