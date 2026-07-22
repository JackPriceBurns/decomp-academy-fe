# Decomp Academy — frontend

A Next.js app that teaches decompiling GameCube PowerPC assembly back into
matching C. Lessons live as Markdown under `src/curriculum/` and are compiled to
JSON by `scripts/build-curriculum.mjs` (runs on `predev`/`prebuild`).

The tree is course → tier → chapter → lesson, each level a `<NN>-<id>` folder
with a `_course.md` / `_tier.md` / `_chapter.md` (lessons are the leaf `.md`
files). Today there is one course, `01-gamecube-c`; more can be added as sibling
course folders. Lessons render at `/courses/<course>/lesson/<slug>` (the bare
`/lesson/<slug>` 308-redirects to the default course).

## Authoring exercise lessons

Each exercise lesson is
`src/curriculum/<NN>-<course>/<NN>-<tier>/<NN>-<chapter>/<NNN>-<slug>.md`:
YAML frontmatter, a prose body, an optional `<!-- starter -->` ```c block, and a
`<!-- solution -->` ```c block. The app shows the learner the target assembly (in
the diff view) and they write C that compiles to it.

**Deriving the signature is part of the exercise.** From the warm-up
`02-reading-signatures` chapter onward, exercises **omit the starter block** so
the learner writes the whole function from scratch — return type, arguments, and
body — inferring the signature from the target assembly, the way real decomp
works. With no starter block the editor seeds a name-only comment (`// define
<symbol> to match the target`); the symbol name is the one thing legitimately
known up front (it's also shown in the header). Only the pre-ABI foundations
exercises still ship a starter scaffold.

When writing or editing an exercise, these rules are **mandatory**:

- **Never reveal the answer.** The C solution — or any trivially copyable form of
  it — must not appear in the prose description or the `## Your task` line. The
  learner derives the C from the technique you teach plus the target assembly.
  (e.g. do NOT write "`a + b - c` is two operations"; teach what the instructions
  do and let them work it out.)
- **Don't hand over the signature in visible prose.** For no-starter lessons, the
  arg count, argument types, and return type are part of what the learner must
  derive — so the body and the `## Your task` line must not state them (no "takes
  two `int`s", no "returns an `int`"). Teaching the *technique* for reading a
  signature is fine; stating *this* function's signature is not. Exception:
  **hints** are the opt-in escape hatch and may reveal the signature.
- **Always use a different worked example** than the exercise's own function —
  different operands / constants / registers — so the learner transfers the idea
  instead of copying it. Never walk through the exact solution.
- **Any assembly shown must be real compiler output.** Compile the example with the
  MWCC GC/2.0 toolchain and paste its actual disassembly; never invent or
  hand-write assembly.
- **The `## Your task` line points at the assembly to reproduce**, naming only the
  symbol (e.g. "Write `foo` to reproduce the assembly above."), never the C and
  never the signature.
- When editing an existing lesson, change **only the prose body** — keep the
  frontmatter `id`/`symbol`/`context` and the solution block byte-identical.
  (Removing a starter block to convert a lesson to no-scaffold is the one
  deliberate exception.)

### Compiling to verify assembly

```
WIBO=/Users/jackpriceburns/Code/sfa/build/tools/wibo
MWCC=/Users/jackpriceburns/Code/sfa/build/compilers/GC/2.0/mwcceppc.exe
OBJDUMP=/Users/jackpriceburns/Code/sfa/build/binutils/powerpc-eabi-objdump
FLAGS="-nodefaults -proc gekko -align powerpc -enum int -fp hardware -Cpp_exceptions off -O4,p -inline auto -maxerrors 1 -nosyspath -RTTI off -fp_contract on -lang=c"
# write the function to /tmp/x.c (types s8/u8/s16/u16/s32/u32/s64/u64/f32/f64/BOOL
# are available via a shared preamble; NO #include), then:
cd /Users/jackpriceburns/Code/sfa && "$WIBO" "$MWCC" $FLAGS -c /tmp/x.c -o /tmp/x.o && "$OBJDUMP" -M gekko -drz /tmp/x.o
```

Verify every reference solution still compiles after curriculum changes by
running the dev/prod server and hitting `GET /api/admin/verify-all` (compiles
each lesson's reference solution and reports failures).
