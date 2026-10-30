---
id: 298aeea9-edc1-4df8-a16a-734e1dea2fff
slug: loops-cloned-slot
title: "The Cloned Slot: bnezl Back-Edges"
difficulty: 2
concepts:
  - loops
  - branch-likely
  - delay-slots
  - fingerprints
symbol: func_80262bb8
hints:
  - "The duplicated instruction is the accumulation. It uses the counter as an operand, and that is why it had to be cloned instead of placed in a plain delay slot."
  - "The counter steps by 1 this time. Check the `addiu` between the two copies."
---

# The same line, twice

In the last lesson the delay slot held `t += 2`. That is safe on a plain
back-edge, because the instruction is also correct on the final trip, when
the branch falls through. Now suppose the instruction in the slot *reads the
counter*. A plain delay slot always runs, so on the final trip it would run
one time too many, with a counter that has already gone past the limit. IDO
fixes this with the branch-likely instructions from the control chapter,
used here to build a loop. Here is `ramp`, which does `t += i` with `i`
stepping by 2:

```c
s32 ramp(s32 n) {
    s32 t = 0;
    s32 i = 0;
    do {
        t += i;
        i += 2;
    } while (i < n);
    return t;
}
```

```asm
 0:  or    v1, zero, zero  # t = 0
 4:  or    v0, zero, zero  # i = 0
 8:  addu  v1, v1, v0      # t += i for iteration 1, peeled out
 c:  addiu v0, v0, 2       # ── loop top: i += 2
10:  slt   at, v0, a0      # at = (i < n)
14:  bnezl at, 0xc         # go again, and only then run the slot
18:  addu  v1, v1, v0      # (likely slot) t += i for iterations 2..N
1c:  or    v0, v1, zero
20:  jr    ra
24:  nop
```

`addu v1, v1, v0` appears **twice**. Both copies come from one C statement,
which the compiler has *cloned*:

- Line `8` runs it for the **first** iteration, before the loop starts.
- The copy in the `bnezl` slot runs it for every **later** iteration. A
  likely slot is cancelled when the branch falls through, so this copy never
  runs that one extra, wrong time.

So the rotated loop does this: *peel off the first accumulate (run it once
before the loop), then loop over [step, test, accumulate if continuing]*.
When you see this in real code, read the two identical lines as a single C
statement. A likely back-edge (`bnezl`, `bgtzl`, …) whose slot repeats an
instruction just above the loop top is one of IDO's strongest fingerprints.
Nothing else produces this pattern.

The target is the same loop that adds the counter to a total, with a
different step. Your C needs nothing unusual. Write the two-statement body,
and the compiler does the peeling and cloning by itself.

## Your task

Write `func_80262bb8` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80262bb8(s32 n) {
    s32 total = 0;
    s32 i = 0;
    do {
        total += i;
        i++;
    } while (i < n);
    return total;
}
```
