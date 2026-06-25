---
id: optimization-scheduling
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

A load from memory takes several cycles before its result is usable. If the very
next instruction needs that value, the pipeline **stalls**. The `,p` scheduler
avoids this by moving *independent* instructions into the gap — the CPU does
useful work while the load is in flight.

Consider two completely independent sums that are then multiplied. With
scheduling **off**, MWCC emits them in source order — compute `a`, then `b`:

```asm
lwz   r4, 0(r3)
lwz   r0, 4(r3)
add   r5, r4, r0   # a = p[0]+p[1]
lwz   r4, 8(r3)
lwz   r0, 12(r3)
add   r0, r4, r0   # b = p[2]+p[3]
mullw r3, r5, r0
```

With scheduling **on** (the default at `-O4,p`), all four loads are issued
first so their latencies overlap, *then* the adds run back to back:

```asm
lwz   r6, 0(r3)
lwz   r5, 4(r3)
lwz   r4, 8(r3)    # loads batched — latencies overlap
lwz   r0, 12(r3)
add   r3, r6, r5
add   r0, r4, r0
mullw r3, r3, r0
```

Same instructions, **different order and register coloring**. The coloring
isn't random: MWCC assigns registers *after* it has reordered, so a different
schedule yields a different live-range layout and therefore different register
numbers. When a target's order looks "interleaved" like this, it's the
scheduler — not a clue about the source. Your C stays simple; the scheduler
produces the shape.

Here you meet the `#pragma scheduling off` lever for the first time, used on a
single function. Lesson 5 returns to it as a discipline — bracketing a *region*
with a matching `off`/`reset` pair — but the mechanism is the one you see now.

## Your task

Write `combine2(int *p)` to reproduce the unscheduled, source-order assembly
(the first listing above) — same integer computation as the previous lesson,
but with loads sitting next to the adds that consume them. You can't get there
by rewriting the C; the lever is the pragma. Put `#pragma scheduling off`
before the function so the compiler emits instructions in source order.

<!-- starter -->
```c
int combine2(int *p) {
    return 0;
}
```

<!-- solution -->
```c
#pragma scheduling off
int combine2(int *p) {
    int a = p[0] + p[1];
    int b = p[2] + p[3];
    return a * b;
}
```
