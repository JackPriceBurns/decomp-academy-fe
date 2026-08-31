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
  - "`sltu` + `xori 1` is the flip idiom on an UNSIGNED compare: the C tests
    the opposite of less-than — on unsigned operands."
  - "`>=` is the negation of `<`. No off-by-one this time — the register form
    flips exactly."
---

# One letter, two number lines

Every *ordered* comparison of C values so far has been signed. But `sltu` —
which you've only seen doing zero-test duty in the boolean finishers — is
really the unsigned twin of `slt`, and when C compares two unsigned values,
it takes over. The choice between the two is *forced by the C types*, which
makes every compare instruction a type oracle, exactly like `div`/`divu` and
`srl`/`sra` before it.

Why it matters: the bit pattern `0xffffffff` is -1 on the signed number line
but 4,294,967,295 on the unsigned one. Whether it's "less than 5" depends
entirely on which line you're standing on. Here's a compare between two
unsigned counters, feeding a branch:

```asm
 0:  sltu at, a0, a1      # a < b, unsigned — into the scratch register
 4:  beqz at, 0x14        # not below? skip
 8:  or   v0, zero, zero  # (delay slot) the skip path's 0
 c:  jr   ra
10:  or   v0, a2, zero    # below: return y
14:  jr   ra
18:  nop
```

Which shows the other job this lesson has: **ordered compares of two
variables can't fuse into a branch.** The zero-family branches only test
signs; `beq`/`bne` only test equality. For `a < b` the compiler must compute
the boolean first (`slt`/`sltu` into `at`) and then branch on *that* with
`beqz`. A `slt`-then-`beqz` pair reads as one C condition — flipped, as
always.

The decoding rule for the oracle: **`sltu` in the target means the compared
values are unsigned in the C** — declare them `u32`, or the diff hands you a
stubborn one-letter mismatch on an otherwise perfect line.

The target below materializes its answer instead of branching, and chases
the compare with an old friend from the `slti` lesson. Unsigned operands,
one flipped comparison — write the natural C.

## Your task

Write `func_8006bec4`, returning whether `n` has reached `cap`, to reproduce
the target assembly.

<!-- solution -->
```c
s32 func_8006bec4(u32 n, u32 cap) {
    return n >= cap;
}
```
