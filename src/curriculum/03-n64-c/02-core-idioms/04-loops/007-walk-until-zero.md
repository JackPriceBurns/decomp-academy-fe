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
  - "This has the same structure as the worked example, but each element is one byte. So the load is `lbu`, and the pointer steps by 1 instead of 4."
  - "The C is the classic loop that counts the length of a `u8 *` up to a zero byte. The guard load comes first, and the load of the next element sits in the likely slot."
---

# The load that reads one step ahead

Some loops walk through memory until they reach an end marker, such as the
end of a string or the zero at the end of a table. These loops add one
detail to the `while (x != 0)` shape: the tested value comes from a
**load**, and IDO schedules that load in a specific way. Here is
`count_words`, which counts the entries before the first zero in an array of
words:

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
 0:  lw    t6, 0(a0)      # first element, loaded before the loop starts
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

Go through it slowly, because this schedule looks wrong at first:

- **The guard loads `0(a0)`, and the loop loads `4(a0)`.** The first element
  gets its own peeled load and test, before the loop. After that, the loop
  always reads *one element ahead* of the pointer, at offset `+4`. This is
  because by the time the test runs, the `p++` for the current trip has not
  happened yet.
- **The back-edge clones the load** into its likely slot, just like the
  cloned `addu` earlier. The bottom of iteration N loads the value that
  iteration N+1 will test. On the final trip the slot is cancelled, so no
  value read past the end marker is ever *used*.
- **The two likely slots here hold different things.** The guard's slot
  holds the copy of the result for the early exit. The back-edge's slot holds
  the cloned load. Read each slot together with its own branch.

None of that structure appears in the C. You write the simple loop that
tests and then increments. The peeling, the offsets that read ahead, and the
load cloning all come from IDO.

The target is the same walk over *bytes*. Only one mnemonic and one stride
change. There is also a small detail: a byte load zero-extends. That gets its
own lesson in the next chapter. For now, read `lbu` as "load a byte,
unsigned".

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
