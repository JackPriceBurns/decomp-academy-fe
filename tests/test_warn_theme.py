"""Warn utilities must have a readable light-theme counterpart."""

from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1] / "src"
# All current warn classes are single-line string literals/className expressions.
WARN = re.compile(r"(?<![\w:-])(?:(hover:)?(bg|text)-warn)(?:/[^\s\"'`]+)?")


class WarnThemeTest(unittest.TestCase):
    def test_warn_classes_have_matching_light_theme_override(self):
        missing = []
        for path in sorted(ROOT.rglob("*.ts*")):
            for number, line in enumerate(path.read_text().splitlines(), 1):
                for match in WARN.finditer(line):
                    hover, kind = match.group(1) or "", match.group(2)
                    expected = f"theme-light:{hover}{kind}-amber-500"
                    if expected not in line:
                        missing.append(f"{path.relative_to(ROOT)}:{number}: {match.group(0)}")
        self.assertEqual(missing, [], "Missing light-theme warn classes:\n" + "\n".join(missing))


if __name__ == "__main__":
    unittest.main()
