---
id: f3ede802-19ad-490d-9a3e-530539eab776
slug: adv-enums
title: Enums Are Just Numbers
difficulty: 3
concepts:
  - enums
  - conditionals
  - control-flow
symbol: func_800fb7a0
hints:
  - "Match each immediate in the target to its position in the `State` list. The declaration order gives the numbering."
  - "The value copied in the branch's delay slot is what is returned when the test fails. There is one `if` and two returns."
---

# The names disappear at compile time

In C you can give states readable names, and game code does this a lot. It
uses `ST_IDLE`, `ST_RUN` and so on instead of bare numbers. An `enum` is an
`int` with names attached. The enumerators are numbered `0, 1, 2, …` in
declaration order, and after IDO compiles the code, only the numbers remain.
Given this type:

```c
typedef enum { ST_IDLE, ST_RUN, ST_PAUSE, ST_DONE } State;
```

here is `isDone(s)`, which returns whether `s == ST_DONE`:

```asm
xori   v0, a0, 0x3    # XOR with 3: zero only when s IS 3
sltiu  v0, v0, 1      # unsigned < 1: turns "zero" into 1, anything else 0
jr     ra
nop
```

`ST_DONE` compiled to a bare `3`, because it is the fourth name, counting from
zero. Also note the idiom around it. When an equality is used as a *value*
instead of in a branch, it becomes `xori` + `sltiu`, which produces the 0 or
1 without any jump. Remember this pair, because it appears all the time in
code that works with states.

When the comparison controls an `if` instead, you get the branches you
already know: `beq`/`bne` against a small immediate. In both cases,
**matching needs one extra translation step**. When you see a magic number,
look it up in the enum the lesson provides, and write the *name* in your C.
The compiled bytes are the same, because `3` and `ST_DONE` are the same value
to the machine. Real decomp always puts the names back, and so does this
course.

The target uses the same `State` type, which is declared for you, and it
compares against one of the states. Translate every immediate you see into
its name before you write the function.

## Your task

Write `func_800fb7a0` to reproduce the target assembly.

<!-- solution -->
```c
State func_800fb7a0(State s) {
    if (s == ST_RUN) {
        return ST_PAUSE;
    }
    return s;
}
```

<!-- context -->
```c
typedef enum { ST_IDLE, ST_RUN, ST_PAUSE, ST_DONE } State;
```
