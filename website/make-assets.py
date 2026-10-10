"""Generates the raster site assets from the application's artwork.

Favicons, the Apple touch icon, the Open Graph preview image and the optimised
screenshots are produced here, so the repository stores small ready-to-serve
files instead of running an image pipeline in CI.

Two renditions of the brand mark exist, and they must stay in step with the
application's `scripts/generate-icons.py` and `static/favicon.svg`:

* the **artwork** from `assets-source/app-icon.png`, used from 48 px upwards;
* a **simplified mark** (dark tile, cloud, tunnel arch) for 16-32 px, where the
  full illustration stops being legible.

    python website/make-assets.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
STATIC = HERE / "static"
# Original artwork lives in the repository, not in docs/ (which is generated).
SOURCE = HERE / "assets-source"
SOURCE_SCREENSHOT = SOURCE / "servers.png"
SOURCE_CONFIRM = SOURCE / "confirm-dialog.png"
SOURCE_APP_ICON = SOURCE / "app-icon.png"
SOURCE_TUNNEL = SOURCE / "tunnel-running.png"
SOURCE_TUNNELS_PAGE = SOURCE / "tunnels-page.png"
SOURCE_SETTINGS = SOURCE / "settings.png"

BG = (9, 11, 16)
SURFACE = (25, 31, 44)
LINE = (34, 42, 58)
TEXT = (243, 245, 249)
MUTED = (154, 164, 181)
ACCENT = (124, 107, 255)
ACCENT_SOFT = (155, 141, 255)

# Mark colours, matching the application icon set.
NAVY_RGBA = (10, 28, 62, 255)
CLOUD = (33, 150, 255, 255)

SS = 4  # supersampling factor for crisp small icons


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def small_mark(size: int) -> Image.Image:
    """The simplified mark: dark tile, cloud, tunnel arch."""
    s = size * SS
    k = s / 512
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    def box(x0: float, y0: float, x1: float, y1: float) -> list[float]:
        return [x0 * k, y0 * k, x1 * k, y1 * k]

    d.rounded_rectangle(box(0, 0, 512, 512), radius=112 * k, fill=NAVY_RGBA)
    d.rounded_rectangle(box(96, 252, 416, 356), radius=52 * k, fill=CLOUD)
    d.ellipse(box(96, 186, 256, 330), fill=CLOUD)
    d.ellipse(box(256, 168, 424, 322), fill=CLOUD)
    d.ellipse(box(176, 138, 352, 300), fill=CLOUD)
    d.ellipse(box(176, 236, 336, 396), outline=NAVY_RGBA, width=max(int(40 * k), 1))
    d.rectangle(box(176, 316, 216, 356), fill=NAVY_RGBA)
    d.rectangle(box(296, 316, 336, 356), fill=NAVY_RGBA)
    return img.resize((size, size), Image.LANCZOS)


def save_small_mark(size: int, path: Path) -> None:
    small_mark(size).save(path, "PNG", optimize=True)
    kb = max(path.stat().st_size // 1024, 1)
    print(f"  {path.name}  {size}x{size}  {kb} kB")


def artwork(size: int, path: Path, source: Path = SOURCE_APP_ICON) -> Image.Image:
    """The application artwork, fitted to `size`."""
    img = Image.open(source).convert("RGBA")
    img = img.resize((size, size), Image.LANCZOS)
    img.save(path, "PNG", optimize=True)
    kb = max(path.stat().st_size // 1024, 1)
    print(f"  {path.name}  {size}x{size}  {kb} kB")
    return img


def fit_font(draw: ImageDraw.ImageDraw, text: str, max_width: int, start: int, bold: bool = True):
    """Largest font size at which `text` fits inside `max_width`."""
    size = start
    while size > 10:
        f = font(size, bold=bold)
        if draw.textlength(text, font=f) <= max_width:
            return f
        size -= 2
    return font(10, bold=bold)


def make_og(path: Path) -> None:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), BG)
    draw = ImageDraw.Draw(image)

    # soft corner glow, drawn as concentric translucent ellipses
    glow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for i in range(30):
        alpha = int(10 * (1 - i / 30))
        x0 = 880 - i * 18
        y0 = -300 + i * 14
        x1 = 1560 - i * 18
        y1 = max(y0 + 8, 380 - i * 14)
        gdraw.ellipse([x0, y0, x1, y1], fill=ACCENT + (alpha,))
    image = Image.alpha_composite(image.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(image)

    left = 72
    column = 520  # text column, leaving room for the screenshot

    # the brand mark beside the wordmark
    card = image.convert("RGBA")
    card.alpha_composite(small_mark(56), (left, 58))
    image = card.convert("RGB")
    draw = ImageDraw.Draw(image)
    draw.text((left + 70, 66), "Local Server Exposer", font=font(28, bold=True), fill=TEXT)

    title1 = fit_font(draw, "Your local servers,", column, 64)
    title2 = fit_font(draw, "accessible anywhere.", column, 64)
    draw.text((left, 188), "Your local servers,", font=title1, fill=TEXT)
    draw.text((left, 268), "accessible anywhere.", font=title2, fill=ACCENT_SOFT)

    sub = fit_font(draw, "Share local development servers with", column, 24, bold=False)
    draw.text((left, 372), "Share local development servers with", font=sub, fill=MUTED)
    draw.text((left, 408), "Cloudflare Quick Tunnels.", font=sub, fill=MUTED)
    draw.text((left, 452), "One Windows desktop app.", font=sub, fill=MUTED)

    # app screenshot, cropped to the top of the window
    if SOURCE_SCREENSHOT.exists():
        shot = Image.open(SOURCE_SCREENSHOT).convert("RGB")
        target_w = 520
        target_h = int(shot.height * target_w / shot.width)
        shot = shot.resize((target_w, target_h), Image.LANCZOS)
        shot = shot.crop((0, 0, target_w, min(target_h, 300)))
        frame = Image.new("RGB", (target_w + 20, shot.height + 20), SURFACE)
        frame.paste(shot, (10, 10))
        fx, fy = 640, 150
        draw.rounded_rectangle(
            [fx, fy, fx + target_w + 20, fy + shot.height + 20],
            radius=14,
            fill=SURFACE,
            outline=LINE,
            width=2,
        )
        image.paste(frame, (fx, fy))

    draw.line([(left, 528), (width - 72, 528)], fill=LINE, width=1)
    small = fit_font(
        draw, "Windows 10 / 11 · x64      Free download      No telemetry", 1000, 22, bold=False
    )
    draw.text((left, 556), "Windows 10 / 11 · x64", font=small, fill=TEXT)
    x = left + int(draw.textlength("Windows 10 / 11 · x64", font=small)) + 42
    draw.text((x, 556), "Free download", font=small, fill=TEXT)
    x += int(draw.textlength("Free download", font=small)) + 42
    draw.text((x, 556), "No telemetry", font=small, fill=MUTED)

    image.save(path, "PNG")
    print(f"  {path.name}  1200x630  {path.stat().st_size // 1024} kB")


def convert_screenshot(
    source: Path, target: Path, width: int, quality: int = 82, crop: tuple | None = None
) -> None:
    image = Image.open(source).convert("RGB")
    if crop:
        image = image.crop(crop)
    if image.width > width:
        image = image.resize((width, int(image.height * width / image.width)), Image.LANCZOS)
    image.save(target, "WEBP", quality=quality, method=6)
    print(f"  {target.name}  {image.width}x{image.height}  {target.stat().st_size // 1024} kB")


def main() -> None:
    STATIC.mkdir(parents=True, exist_ok=True)
    print("icons:")
    # Favicons use the simplified mark; the touch icon has room for the artwork.
    for size in (16, 32, 48):
        save_small_mark(size, STATIC / f"favicon-{size}.png")
    artwork(180, STATIC / "apple-touch-icon.png")
    print("images:")
    make_og(STATIC / "og-image.png")
    convert_screenshot(SOURCE_SCREENSHOT, STATIC / "app-servers.webp", 1600)
    # Hero crop: the top-left region of the real screenshot, where the first
    # server cards sit. Cropping (rather than shrinking the whole window) keeps
    # the text readable at hero size without altering what the app shows.
    if SOURCE_SCREENSHOT.exists():
        with Image.open(SOURCE_SCREENSHOT) as probe:
            w, h = probe.size
        convert_screenshot(
            SOURCE_SCREENSHOT,
            STATIC / "app-servers-hero.webp",
            1200,
            crop=(0, 0, int(w * 0.60), int(h * 0.72)),
        )
    for source, target, width in (
        (SOURCE_CONFIRM, "app-confirm.webp", 1200),
        (SOURCE_TUNNEL, "app-tunnel.webp", 1200),
        (SOURCE_TUNNELS_PAGE, "app-tunnels.webp", 1200),
        (SOURCE_SETTINGS, "app-settings.webp", 1200),
    ):
        if source.exists():
            convert_screenshot(source, STATIC / target, width)
    if SOURCE_APP_ICON.exists():
        convert_screenshot(SOURCE_APP_ICON, STATIC / "app-icon.webp", 192, quality=88)


if __name__ == "__main__":
    main()
