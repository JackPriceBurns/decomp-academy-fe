---
id: c5b4566d-1911-4938-86a0-2d0f6c74dec7
slug: globals-capstone
title: "Capstone: Global State Like a Real Game"
difficulty: 4
concepts:
  - globals
  - hi-lo
  - rmw
  - capstone
symbol: func_8016d158
hints:
  - "There are two completed addresses (`lui` + `addiu` each) and two read-modify-writes mixed together. Separate them by tracking which pointer register each `lw`/`sw` goes through."
  - "One update subtracts the argument, and its new value is returned. The other adds a constant, and its result is not returned. Write the returned one as the first statement."
---

# Two updates in one function

Real game functions rarely change just one global. When a hit lands, for
example, health goes down, a counter goes up, and a value is returned to the
caller, all in one short function. The compiler mixes their instructions
together, and your job is to separate them again. Here is `logEvent(code)`,
which adds an entry to a global event list. It stores `code` at index
`gEventCount` of the array `gEvents`, increments `gEventCount`, and returns the
new count:

```asm
lui    a1, %hi(gEventCount)
addiu  a1, a1, %lo(gEventCount)  # full address: used three times below
lw     v1, 0(a1)                 # count
lui    at, %hi(gEvents)
sll    t6, v1, 2                 # count * 4
addu   at, at, t6
sw     a0, %lo(gEvents)(at)      # gEvents[count] = code
addiu  v0, v1, 1
sw     v0, 0(a1)                 # gEventCount = count + 1 (and v0 returns)
jr     ra
nop
```

Every idiom from this chapter appears here: a completed address reused for a
read-modify-write, an indexed array store where the index is added to the `%hi`
half, and the bump-and-return pattern, where `v0` is both the stored value and
the return value. Notice that the *array* access sits in the middle of the
*counter* update. Instruction order is chosen for the pipeline, so it does not
follow the order of your statements. The `sw`s tell you *what* was updated, but
they may not appear in statement order. Expect to reason about which order of C
statements the compiler was given, or to try both orders.

The target combines two global updates in the same way. Group every memory
operation by the address it goes through, and work out what each update does.
Then check which update's new value ends up in `v0`.

## Your task

`extern s32 gHealth;` and `extern s32 gHits;` are declared for you. Write
`func_8016d158` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8016d158(s32 dmg) {
    gHealth -= dmg;
    gHits += 1;
    return gHealth;
}
```

<!-- context -->
```c
extern s32 gHealth;
extern s32 gHits;
```
