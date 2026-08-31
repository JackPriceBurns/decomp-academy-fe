---
id: 6c0ab752-ffc7-4a86-ace9-3c9969f2415e
slug: loops-walk-until-zero
title: "Walking Memory Until Zero"
difficulty: 3
concepts:
  - loops
  - pointers
  - branch-likely
  - delay-slots
symbol: func_80302adc
hints:
  - "Same skeleton as the worked example, but the element is one byte — so the load is `lbu` and the pointer steps by 1, not 4."
  - "The C is the classic count-the-length loop over a `u8 *` ending at a zero byte. Guard load first, next-load in the likely slot."
---

# The load that reads one step ahead

Loops that walk memory until a terminator — end of a string, end of a
zero-terminated table — add one wrinkle to the `while (x != 0)` shape: the
tested value comes from a **load**, and IDO schedules that load in a very
particular way. Here's `count_words`, which counts entries before the first
zero in a word array:

```c
s32 count_words(s32 *p) {
    s32 n = 0;
    while (*p != 0) {
        p++;
        n++;
    }
    return n;
}
```

```asm
 0:  lw    t6, 0(a0)      # first element — loaded before any loop exists
 4:  or    v1, zero, zero # n = 0
 8:  beqzl t6, 0x28       # empty from the start? straight to the exit…
 c:  or    v0, v1, zero   # (likely slot) …copying out n = 0
10:  lw    t7, 4(a0)      # ── loop top: load the NEXT element
14:  addiu a0, a0, 4      # p++
18:  addiu v1, v1, 1      # n++
1c:  bnezl t7, 0x14       # next one non-zero? go around…
20:  lw    t7, 4(a0)      # (likely slot) …reloading the next element
24:  or    v0, v1, zero
28:  jr    ra
2c:  nop
```

Walk it slowly, because this schedule looks wrong until it clicks:

- **The guard loads `0(a0)`, the loop loads `4(a0)`.** The first element
  gets a private, peeled load and test. From then on the loop always
  inspects *one element ahead* of the pointer, at offset `+4` — because by
  the time the test runs, `p++` for the current trip hasn't happened yet.
- **The back-edge clones the load** into its likely slot, exactly like the
  cloned `addu` earlier: iteration N's bottom loads the value iteration
  N+1 will test. On the final trip the slot cancels — no read past the
  terminator gets *used*.
- **Both likely slots here hold different things** — the guard's holds the
  early-out copy of the result, the back-edge's holds the cloned load.
  Read each slot with its own branch.

None of that structure appears in the C. You write the naive
test-then-increment loop; peeling, look-ahead offsets, and load cloning are
all IDO. The target is the same walk over *bytes* — one mnemonic and one
stride change, plus the little detail that a byte load zero-extends (a
lesson of its own next chapter; for now, `lbu` = "load a byte, unsigned").

## Your task

Write `func_80302adc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80302adc(u8 *s) {
    s32 n = 0;
    while (*s != 0) {
        s++;
        n++;
    }
    return n;
}
```
