"""Guard the published Open Graph/Twitter image and its light palette."""

from pathlib import Path
import struct
import unittest
import xml.etree.ElementTree as ET
import zlib


def png_details(path: Path):
    data = path.read_bytes()
    assert data.startswith(b"\x89PNG\r\n\x1a\n")
    offset, compressed = 8, bytearray()
    width = height = 0
    while offset < len(data):
        length = struct.unpack_from(">I", data, offset)[0]
        kind = data[offset + 4 : offset + 8]
        chunk = data[offset + 8 : offset + 8 + length]
        if kind == b"IHDR":
            width, height, depth, color = struct.unpack_from(">IIBB", chunk)
            assert depth == 8 and color in (2, 6)  # RGB or RGBA
        if kind == b"IDAT":
            compressed.extend(chunk)
        offset += length + 12
    # PNG's first pixel has no left/up neighbours, regardless of row filter.
    first_pixel = zlib.decompress(compressed)[1:4]
    return (width, height), tuple(first_pixel)

ROOT = Path(__file__).resolve().parents[1]
CARD = "/brand/png/og-image.png"


class SocialCardTest(unittest.TestCase):
    def test_social_card_is_light_and_shared_by_both_previews(self):
        svg = ET.parse(ROOT / "public/brand/svg/og-image.svg").getroot()
        self.assertEqual((svg.attrib["width"], svg.attrib["height"]), ("1200", "630"))
        rect = svg.find("{http://www.w3.org/2000/svg}rect")
        self.assertIsNotNone(rect)
        assert rect is not None
        self.assertEqual(rect.attrib["fill"], "#F6F6FB")
        size, first_pixel = png_details(ROOT / "public/brand/png/og-image.png")
        self.assertEqual(size, (1200, 630))
        self.assertEqual(first_pixel, (246, 246, 251))
        layout = (ROOT / "src/app/layout.tsx").read_text()
        self.assertEqual(layout.count(CARD), 2)  # Open Graph and Twitter


    def test_derived_page_metadata_keeps_social_image(self):
        for page in (
            "src/app/courses/[course]/lesson/[slug]/page.tsx",
            "src/app/glossary/page.tsx",
        ):
            with self.subTest(page=page):
                source = (ROOT / page).read_text()
                self.assertIn(CARD, source)


if __name__ == "__main__":
    unittest.main()
