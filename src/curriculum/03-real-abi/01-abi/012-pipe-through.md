---
id: abi-pipe-through
title: "Chaining: Pipe One Call's Result Into the Next"
difficulty: 4
concepts:
  - calls
  - saved-registers
  - arguments
  - return-value
  - chaining
symbol: pipe2
hints:
  - The second argument of the final call is needed only *after* the first call
    returns, so it must survive in `r31`.
  - The first call's result is already in `r3` — exactly the first argument slot
    for the second call — so it passes through untouched; only the survivor has
    to be moved into place.
---

# Feeding one call from another

When the result of one call becomes an argument to the next, the two ABI rules
interact. The first call leaves its result in `r3`. If the *second* call wants
that result as its first argument, it's already in the right register — but any
other argument the second call needs must have been kept alive across the first
call in a callee-saved register.

Consider `relay2(x, y)`, which computes `f(x)` and then returns `h(y, f(x))`:

```asm
stwu   r1,-16(r1)
mflr   r0
stw    r0,20(r1)
stw    r31,12(r1)
mr     r31,r4       # y is needed after f() -> save it in r31
bl     f            # f(x); result in r3
mr     r0,r3        # stash the result
mr     r3,r31       # y becomes the 1st arg of h
mr     r4,r0        # the result becomes the 2nd arg
bl     h            # h(y, f(x))
lwz    r0,20(r1)
mtlr   r0
addi   r1,r1,16
blr
```

Because `h` wants `y` *first* and the result *second*, the compiler does a small
three-instruction shuffle to swap them into `r3`/`r4`. The whole thing returns
`h`'s value with no final `mr`, since `h`'s result and `relay2`'s return value
share `r3`.

The target assembly for `pipe2` is the same idea but the final call takes its
arguments in the **opposite** order — so the first call's result needs *no* move
to reach its argument slot, and only the survivor has to be loaded in. That
collapses the shuffle to a single `mr`. Trace which parameter is saved in `r31`,
where the first result flows, and what the second call is.

## Your task

Write `pipe2`, which chains a call into a second call, to reproduce the target
assembly. `step` and `mix` are declared for you.

<!-- starter -->
```c
int pipe2(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int pipe2(int a, int b) {
    int t = step(a);
    return mix(t, b);
}
```

<!-- context -->
```c
extern int step(int p);
extern int mix(int p, int q);
```
