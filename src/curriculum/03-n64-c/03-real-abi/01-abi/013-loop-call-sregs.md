---
id: 6cc610cf-00bf-4a35-a150-993e763187f5
slug: abi-loop-call-sregs
title: "Saved Registers: A Loop Around a Call"
difficulty: 4
concepts:
  - abi
  - saved-registers
  - loops
  - calls
symbol: func_80331840
hints:
  - "Four saved registers this time. One holds the limit, one the running total — and two work together on the counter. Watch the `addiu s1, s0, 1`."
  - "The call's argument is the *incremented* counter, and the loop's `bne` compares that incremented value against the limit."
---

# Enter s0 through s7

Home slots work, but imagine reloading from the stack on *every trip* around a
loop that makes a call. For values that stay hot across many calls, the ABI has
a better tool: the **saved registers** `s0`–`s7`. Their contract is the reverse
of the `t`-registers': any function that writes one must put the old value back
before returning. So a callee can trample `t6` freely, but whatever your
function parks in `s0` is *still there* after every `jal`.

The price: your function must obey the same contract, saving each `s`-register
it uses in its frame and restoring it on the way out. Here's `sumCalls(n)`,
which sums `get(i)` for `i` from 0 to `n-1`:

```asm
 0:  addiu  sp, sp, -40
 4:  sw     s2, 32(sp)      # save the old s2…
 8:  or     s2, a0, zero    # …then n moves in
12:  sw     ra, 36(sp)
16:  sw     s1, 28(sp)
20:  sw     s0, 24(sp)
24:  or     s1, zero, zero  # total = 0
28:  blez   s2, 56          # n <= 0 ⇒ skip the loop entirely
32:  or     s0, zero, zero  # i = 0 (branch delay slot)
36:  jal    get             # ── loop top ──
40:  or     a0, s0, zero    # argument: i
44:  addiu  s0, s0, 1       # i++
48:  bne    s0, s2, 36      # back to 36 while i != n
52:  addu   s1, s1, v0      # total += result (delay slot does loop work!)
56:  or     v0, s1, zero
60:  lw     ra, 36(sp)
64:  lw     s0, 24(sp)      # restore in ascending order
68:  lw     s1, 28(sp)
72:  lw     s2, 32(sp)
76:  jr     ra
80:  addiu  sp, sp, 40
```

A lot of structure to absorb:

- **One save per `s`-register used**, stacked below `ra`, and every one
  restored in the epilogue — `s0` at the lowest slot, counting up. The saves
  interleave with real setup (the scheduler again); the restores come in a
  tidy ascending run.
- **The loop body is tiny** because `i`, `total`, and `n` never leave their
  registers. No home-slot traffic anywhere.
- **Delay slots do loop work.** `i = 0` rides the entry branch; the argument
  copy rides the `jal`; `total += result` rides the back-branch. Reading a
  MIPS loop means reading every branch *with* its shadow instruction.
- `blez` guards the whole loop: a `for` whose condition can fail on entry
  compiles to a test *before* the loop as well as one at the bottom.

The target is a close cousin: same skeleton, four saved registers, and a small
twist in what gets passed to the callee each trip. The hints will keep you
honest.

## Your task

`extern s32 price(s32 slot);` is declared for you. Write `func_80331840` to
reproduce the target assembly.

<!-- solution -->
```c
s32 func_80331840(s32 n) {
    s32 t = 0;
    s32 i;

    for (i = 0; i < n; i++) {
        t += price(i + 1);
    }
    return t;
}
```

<!-- context -->
```c
extern s32 price(s32 slot);
```
