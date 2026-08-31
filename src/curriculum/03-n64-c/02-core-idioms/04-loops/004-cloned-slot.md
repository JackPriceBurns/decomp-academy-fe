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
  - "The duplicated instruction is the accumulation — it uses the counter as an operand, which is exactly why it had to be cloned rather than parked."
  - "Counter steps by 1 this time; check the `addiu` between the clones."
---

# The same line, twice

Last lesson the slot held `t += 2` — safe on a plain back-edge because it
was correct on the final, falling-through trip too. But park an instruction
that *reads the counter* in an always-runs slot and the fall-through trip
would execute it one time too many, with a counter that's already walked
past the limit. IDO's fix is the branch-likely trick from the control
chapter, turned into a loop engine. Here's `ramp` — `t += i` with `i`
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
 8:  addu  v1, v1, v0      # t += i — iteration 1, peeled out
 c:  addiu v0, v0, 2       # ── loop top: i += 2
10:  slt   at, v0, a0      # at = (i < n)
14:  bnezl at, 0xc         # go again — and only then run the slot
18:  addu  v1, v1, v0      # (likely slot) t += i — iterations 2..N
1c:  or    v0, v1, zero
20:  jr    ra
24:  nop
```

`addu v1, v1, v0` appears **twice**. That's not a bug and not two C
statements — it's one statement, *cloned*:

- Line `8` runs it for the **first** iteration, before the loop proper.
- The copy in the `bnezl` slot runs it for every **later** iteration — and
  because a likely slot is cancelled when the branch falls through, it
  never runs that one extra, wrong time.

So the rotated loop is really: *peel the first accumulate, then loop
[step, test, accumulate-if-continuing]*. When you meet this in the wild,
read the two identical lines as a single C statement and move on. A likely
back-edge (`bnezl`, `bgtzl`, …) whose slot mirrors an instruction just
above the loop top is one of IDO's strongest fingerprints — nothing else
produces it.

The target is the same accumulate-the-counter loop with a different step.
Your C needs nothing exotic: write the two-statement body and the compiler
does the peeling and cloning on its own.

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
