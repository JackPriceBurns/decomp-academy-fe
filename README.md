# Decomp Academy — Master MWCC GC/2.0

An interactive course that takes you from *never having read a register* to
matching real **Star Fox Adventures** functions, instruction for instruction.
You write C; the **real Metrowerks CodeWarrior GC/2.0 compiler** grades it live.

## Curriculum

364 lessons across 17 chapters, strictly progressive:

1. **Foundations** — registers, return values, reading MWCC output
2. **The Decomp Loop** — match %, objdump, diffing, diagnosing a near-match
3. **Integer Arithmetic** · 4. **Bitwise & Shifts** · 5. **Control Flow**
   (signed vs unsigned compares) · 6. **Loops** · 7. **Types & Width**
   (the `u8`-not-`char` rule) · 8. **Pointers** · 9. **Structs, Unions & Bitfields**
   · 10. **Floating Point** (frsp, fmadds) · 11. **Functions & the ABI**
   (stack frames, declaration-order register coloring)
12. **Globals, the SDA & Pools** — `@sda21`, `@ha`/`@l`, literal pools
13. **Optimization & Scheduling** — peephole, scheduling, the `#pragma` toggles
14. **Advanced Idioms** — paired-singles, switch jump tables, enums, `volatile`
15. **64-bit Integers** — `long long` register pairing, carry chains (`addc`/`adde`),
    downcast fingerprints, and the divide/shift intrinsics
16. **Practice Gauntlet** — ~160 generated drills for endless reps
17. **Real-World Mastery** — 10 authentic SFA capstones, up to ~80 instructions

## Running it locally

Requires Node 18+ and the sibling [`../sfa`](../sfa) decompilation project present
(it provides the MWCC compiler and binutils). Point elsewhere with
`SFA_ROOT=/path/to/sfa`.

```sh
npm install
npm run dev      # http://localhost:3000
```

## Contributing

Contributions are very welcome — especially new lessons. The workflow is the
standard GitHub fork-and-PR flow:

1. **Fork** the repository on GitHub and clone your fork:
   ```sh
   git clone https://github.com/<your-username>/decomp-academy-fe
   cd decomp-academy-fe
   ```
2. **Create a branch** for your change:
   ```sh
   git checkout -b my-new-lessons
   ```
3. **Make your changes** (see "Adding a lesson" below), commit, and push to your
   fork:
   ```sh
   git commit -am "Add lessons on <topic>"
   git push origin my-new-lessons
   ```
4. **Open a Pull Request** from your branch against this repo's `main`. Describe
   what you added and, for new lessons, which compiler behaviour they teach.

### Where the content lives

All content lives under **`src/curriculum/`** as a three-level folder tree —
ordering and grouping come entirely from the folder/file names, so there's no
config map to maintain:

```
src/curriculum/
  03-real-abi/              ← tier ("act" on the curriculum map)
    _tier.md                  title + one-line blurb
    05-int64/                ← chapter
      _chapter.md             title + one-line blurb
      001-register-pairing.md ← lesson
      002-add.md
```

- Every folder is named `NN-<id>`. The `NN` prefix orders siblings *within* its
  parent only — chapters restart at `01` inside each tier. The global chapter
  number shown on the site (e.g. mastery = 17) is computed automatically.
- A **lesson** `.md` has YAML frontmatter (`id`, `title`, `difficulty`,
  `concepts`, `symbol`, `hints`) followed by the explanation and a
  `<!-- starter -->` / `<!-- solution -->` C block.

The build step compiles this Markdown tree into JSON the app imports — it runs
automatically before `dev`/`build`, or on demand:

```sh
npm run curriculum
```

### Adding a lesson

1. Pick (or create) a chapter folder under the appropriate tier in
   `src/curriculum/` (add a new chapter with its own `_chapter.md`, or a new
   tier with a `_tier.md`).
2. Copy an existing `NNN-<slug>.md` as a template and edit the frontmatter,
   explanation, starter, and solution. The `symbol` field is the function name
   the grader compiles and diffs.
3. Verify your reference solution actually compiles to that symbol on the real
   toolchain:
   ```sh
   node scripts/cc.mjs path/to/solution.c <symbol>
   ```
4. Run `npm run curriculum` and check the lesson appears in the app.

Because the *real* compiler is in the loop, every lesson target must be
truthful — write the C, compile it, and quote the assembly the compiler actually
emits. Nothing is hand-waved or hard-coded.

## License

Decomp Academy is free software licensed under the **GNU Affero General Public
License v3.0** ([AGPL-3.0](LICENSE)). You are free to use, study, modify, and
redistribute it — but any derivative work, **including a modified version run as
a network service**, must also be released under the AGPL-3.0 with its complete
source code made available. See [LICENSE](LICENSE) for the full text.
