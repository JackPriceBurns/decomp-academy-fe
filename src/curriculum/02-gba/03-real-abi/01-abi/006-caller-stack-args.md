---
id: 96c37633-b37c-44d7-bac0-d62fc061625e
slug: gba-abi-caller-stack-args
title: Pushing Arguments for a Call
difficulty: 4
concepts:
  - abi
  - arguments
  - stack
symbol: func_082f3c40
hints:
  - "Twelve bytes of outgoing block means three arguments beyond the four in registers — so count seven in total, and read `[sp, #0]`, `[sp, #4]` and `[sp, #8]` as arguments five, six and seven."
  - "Two `s32` parameters in, an `s32` out, and the call's result is returned unchanged. Watch the `mov r4, r0` / `mov r0, r1` pair at the top: it swaps the two parameters before the argument list is built."
---

# The outgoing block

Seen from the caller, arguments past the fourth are just memory the callee will
read. gcc reserves that memory once, in the prologue, with a `sub sp, #N` sized
for the *largest* call anywhere in the function, and releases it once in the
epilogue with a matching `add sp, #N`. There is no push-per-argument and no
adjustment between calls.

The block sits at the bottom of the frame, so argument five is written to
`[sp, #0]`, six to `[sp, #4]`, seven to `[sp, #8]`. Here is a five-argument
call:

```asm
0        push      {r4, lr}
2        sub       sp, #4
4        lsl       r2, r0, #2
6        add       r3, r1, #3
8        mov       r4, r0
10       mul       r4, r1
12       str       r4, [sp, #0]
14       bl        five-4
18       add       sp, #4
20       pop       {r4}
22       pop       {r1}
24       bx        r1
```

Four bytes of block for one stack argument. Arguments one and two already sat in
`r0` and `r1` untouched, so nothing needed doing for them; three and four were
computed straight into `r2` and `r3`; and the fifth had nowhere left to go, which
is why `r4` gets borrowed — and why a function that only makes one call ends up
saving a callee-saved register.

The ordering is worth internalising. A stack word has to be built in a register
before it can be stored, and by the time gcc reaches the fifth argument the
registers it would build in are the ones already holding arguments one to four.
Nothing was spare here — `r0` and `r1` still held arguments one and two, `r2`
and `r3` had been written into — so `r4` was borrowed for two instructions'
worth of work. When a low register *is* still spare, gcc builds the stack words
in that one and fills it with its own argument last, after every `str` is done.
Either way, reading a call site from top to bottom will not hand you the
argument list in order: the `str`s and the `mov`s into `r0`-`r3` are sequenced
by what was still free, not by argument number.

Your target reserves a bigger block than this one, and one of the values it
stores there is a bare constant.

## Your task

`extern s32 emitRun(s32 a, s32 b, s32 c, s32 d, s32 e, s32 f, s32 g);` is
declared for you. Write `func_082f3c40` to reproduce the target assembly.

<!-- context -->
```c
extern s32 emitRun(s32 a, s32 b, s32 c, s32 d, s32 e, s32 f, s32 g);
```

<!-- solution -->
```c
s32 func_082f3c40(s32 base, s32 n) {
    return emitRun(n, base, base * 2, base + n, 1, n - 1, base);
}
```
