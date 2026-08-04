---
id: 2c5192b9-fdca-5d5e-981c-4fdd48649f62
slug: optimization-peephole-off
title: "#pragma peephole off: Unfusing the Merge"
difficulty: 4
concepts:
  - peephole
  - pragma
  - dot-form
symbol: func_80314648
hints:
  - "The body is exactly the `func_801c2540` body — `int y = x & 0xFF; return y ? a + y :
    b;`."
  - "The pragma, not the C, changes the output: the mask stays plain and the
    compare is emitted separately."
  - Leave the `#pragma peephole off`/`reset` lines exactly as given.
---

# When the target *kept* its separate compare

Sometimes the retail object got built with the peephole pass switched off over
some region, so the dot-merge from last lesson simply didn't run. What you find
instead is a plain, undotted instruction followed by an explicit `cmpwi ...,0`.
No amount of C rewriting brings that back. The only lever is the pragma the
original author reached for.

```c
#pragma peephole off
/* ...function... */
#pragma peephole reset
```

Wrap the body in that pragma and the exact code that merged a moment ago now
keeps its compare standing on its own.

```asm
clrlwi  r0, r3, 24    # mask — NOT the dot form
cmpwi   r0, 0         # explicit compare the peephole would have absorbed
beq-    L
add     r3, r4, r0
```

Put the two outputs next to each other and the dot-merge is the whole
difference.

```asm
# peephole ON (lesson 3)   # peephole OFF (this lesson)
clrlwi. r0, r3, 24         clrlwi  r0, r3, 24
                           cmpwi   r0, 0
beq-    L                  beq-    L
```

The `.` disappears and a full `cmpwi` walks back in. That's the textbook
fingerprint of `peephole off`. In real decomp work you fence a function, or a
stretch of several, and every `off` gets a matching `reset`.

> Both the starter and the solution already carry the `#pragma peephole off` /
> `reset` lines, so all you owe is the body. The same pair was applied to the
> reference target, which is how it ended up un-merged in the first place.

## Your task

Write `func_80314648` (same logic as `func_801c2540` from last lesson) so that,
with peephole disabled, you match the un-merged `clrlwi` + `cmpwi` + `beq-`
sequence.

<!-- starter -->
```c
#pragma peephole off
int func_80314648(int x, int a, int b) {
    return 0;
}
#pragma peephole reset
```

<!-- solution -->
```c
#pragma peephole off
int func_80314648(int x, int a, int b) {
    int y = x & 0xFF;
    return y ? a + y : b;
}
#pragma peephole reset
```
