---
id: 61afb160-c6c8-40c0-aebd-0b76aa1ef1e5
slug: control-unsigned-compare
title: "sltu: The Compare Chooses the Types"
difficulty: 2
concepts:
  - compare
  - types
  - booleans
symbol: func_8006bec4
hints:
  - "`sltu` + `xori 1` is the flip pattern on an UNSIGNED compare: the C tests
    the opposite of less-than, on unsigned operands."
  - "`>=` is the negation of `<`. There is no off-by-one this time, because the
    register form flips exactly."
---

# One letter, two kinds of comparison

Every *ordered* comparison of C values so far has been signed. You have only
seen `sltu` testing for zero in the boolean finishing instructions, but it is
also the unsigned version of `slt`. When C compares two unsigned values, the
compiler uses `sltu`. The choice between the two is *forced by the C types*.
That means every compare instruction tells you the types, exactly like
`div`/`divu` and `srl`/`sra` before it.

This matters because the bit pattern `0xffffffff` is -1 as a signed value but
4,294,967,295 as an unsigned one. Whether it is "less than 5" depends entirely
on which reading you use. Here is a compare between two unsigned counters,
feeding a branch:

```asm
 0:  sltu at, a0, a1      # a < b, unsigned, into the scratch register
 4:  beqz at, 0x14        # not below? skip
 8:  or   v0, zero, zero  # (delay slot) the skip path's 0
 c:  jr   ra
10:  or   v0, a2, zero    # below: return y
14:  jr   ra
18:  nop
```

This shows the other point of this lesson: **an ordered compare of two
variables can't be built into a branch.** The sign branches from earlier only
compare with zero, and `beq`/`bne` only test equality. For `a < b` the
compiler must compute the boolean first (`slt`/`sltu` into `at`) and then
branch on *that* with `beqz`. Read a `slt` followed by `beqz` as one C
condition, flipped as always.

The decoding rule: **`sltu` in the target means the compared values are
unsigned in the C**. Declare them `u32`, or the diff will show a one-letter
mismatch on a line that is otherwise perfect.

The target below computes its answer as a value instead of branching, and
follows the compare with an instruction you know from the `slti` lesson. Work
out the types from the compare, then write the flipped comparison as natural C.

## Your task

Write `func_8006bec4` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8006bec4(u32 n, u32 cap) {
    return n >= cap;
}
```
