---
id: ed4bc196-98e4-5769-8df0-212f5f06c1bd
slug: optimization-scheduling
title: "Instruction Scheduling: Hiding Latency"
difficulty: 3
concepts:
  - scheduling
  - latency
  - pipelining
symbol: combine2
hints:
  - The C body is identical to the previous lesson — two sums, then a multiply.
  - To freeze the loads in source order, add `#pragma scheduling off` on the
    line before the function.
  - With scheduling off, each `add` sits right after its own pair of loads —
    matching the first listing in the brief.
---

# Why the order looks scrambled

A load isn't free. The value needs a few cycles to come back from memory, and if
the next instruction grabs at it right away, the pipeline stalls. `,p` scheduling
hides that wait by dropping independent instructions into the gap, giving the CPU
something to chew on while the load finishes.

Here are two sums that share nothing with each other, multiplied right at the
end. With the scheduler switched off, MWCC stays faithful to your text and runs
`a` start to finish before it ever begins `b`.

```asm
lwz   r4, 0(r3)
lwz   r0, 4(r3)
add   r5, r4, r0   # a = p[0]+p[1]
lwz   r4, 8(r3)
lwz   r0, 12(r3)
add   r0, r4, r0   # b = p[2]+p[3]
mullw r3, r5, r0
```

Switch it back on, which is what `-O4,p` does unless you stop it, and the shape
changes entirely. All four loads leave first so their latencies pile up in
parallel, and neither `add` runs until its operands have landed.

```asm
lwz   r6, 0(r3)
lwz   r5, 4(r3)
lwz   r4, 8(r3)    # loads batched — latencies overlap
lwz   r0, 12(r3)
add   r3, r6, r5
add   r0, r4, r0
mullw r3, r3, r0
```

Identical instructions. Different order, and different register numbers to match.
The renumbering follows from the reorder, not from chance, because MWCC colors
registers only once the schedule is fixed; change the schedule and the live
ranges change, which drags the register numbers around with them. An interleaved
target, then, is the scheduler talking. It says nothing about how you wrote the
source. Keep the C plain and the scheduler will shape it.

This is the `#pragma scheduling off` lever, and this is the first time you'll
touch it, on one lone function. Lesson 5 brings it back as a real technique,
fencing off a region between a matching `off` and `reset`, but the gear is
identical to what you're using here.

## Your task

Write `combine2(int *p)` to reproduce the unscheduled, source-order assembly
(the first listing above) — same integer computation as the previous lesson,
but with loads sitting next to the adds that consume them. You can't get there
by rewriting the C; the lever is the pragma. Put `#pragma scheduling off`
before the function so the compiler emits instructions in source order.

<!-- solution -->
```c
#pragma scheduling off
int combine2(int *p) {
    int a = p[0] + p[1];
    int b = p[2] + p[3];
    return a * b;
}
```
