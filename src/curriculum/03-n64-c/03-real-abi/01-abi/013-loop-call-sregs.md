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
  - "This time there are four saved registers. One holds the limit and one holds the running total. The other two work together on the counter. Watch the `addiu s1, s0, 1`."
  - "The call's argument is the *incremented* counter, and the loop's `bne` compares that incremented value against the limit."
---

# Saved registers: s0 through s7

Home slots work, but think about a loop that makes a call. The function would
have to reload from the stack on *every pass* through the loop. For values that
are used across many calls, the ABI has a better option: the **saved
registers** `s0` through `s7`. Their rule is the opposite of the rule for the
`t`-registers. Any function that writes a saved register must put the old value
back before it returns. So a callee can overwrite `t6` freely, but anything your
function puts in `s0` is *still there* after every `jal`.

The cost is that your function must follow the same rule. It saves each
`s`-register it uses in its frame and restores it before returning. This is
`sumCalls(n)`, which adds up `get(i)` for `i` from 0 to `n-1`:

```asm
 0:  addiu  sp, sp, -40
 4:  sw     s2, 32(sp)      # save the old s2
 8:  or     s2, a0, zero    # then n moves in
12:  sw     ra, 36(sp)
16:  sw     s1, 28(sp)
20:  sw     s0, 24(sp)
24:  or     s1, zero, zero  # total = 0
28:  blez   s2, 56          # if n <= 0, skip the loop entirely
32:  or     s0, zero, zero  # i = 0 (branch delay slot)
36:  jal    get             # loop top
40:  or     a0, s0, zero    # argument: i
44:  addiu  s0, s0, 1       # i++
48:  bne    s0, s2, 36      # back to 36 while i != n
52:  addu   s1, s1, v0      # total += result (the delay slot does loop work)
56:  or     v0, s1, zero
60:  lw     ra, 36(sp)
64:  lw     s0, 24(sp)      # restore in ascending order
68:  lw     s1, 28(sp)
72:  lw     s2, 32(sp)
76:  jr     ra
80:  addiu  sp, sp, 40
```

There is a lot to take in here:

- **There is one save for each `s`-register used.** The saves are stacked
  below `ra`, and each one is restored in the epilogue, with `s0` in the lowest
  slot and the others counting up. The saves are mixed in with real setup work
  (the scheduler again), while the restores come in a neat ascending run.
- **The loop body is tiny** because `i`, `total` and `n` stay in their
  registers the whole time. There are no stores to or loads from the home
  slots.
- **Delay slots do loop work.** `i = 0` is in the delay slot of the entry
  branch. The argument copy is in the delay slot of the `jal`. `total += result`
  is in the delay slot of the branch back to the loop top. To read a MIPS loop,
  read every branch *together with* the instruction in its delay slot.
- `blez` guards the whole loop. A `for` loop whose condition can be false on
  entry compiles to a test *before* the loop as well as one at the bottom.

The target is very similar. It has the same structure, but it uses four saved
registers, and it passes something slightly different to the callee on each
pass. The hints can help if you get stuck.

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
