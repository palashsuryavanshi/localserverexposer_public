"""Generates the raster site assets from the repository's existing artwork.

Favicons, the Apple touch icon, the Open Graph preview image and optimised
screenshots are produced here so the repository stores small, ready-to-serve
files instead of running an image pipeline in CI.

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
CYAN = (53, 214, 232)

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


def draw_mark(draw: ImageDraw.ImageDraw, scale: float, offset=(0.0, 0.0)) -> None:
    """The site symbol: a local device with a connection leaving it."""
    s = scale
    ox, oy = offset

    def P(x, y):
        return (ox + x * s, oy + y * s)

    draw.rounded_rectangle(
        [*P(2.6, 8.2), *P(14.2, 17.4)], radius=2.4 * s, outline=TEXT, width=max(int(1.6 * s), 1)
    )
    draw.line([*P(5.8, 12.2), *P(10.4, 12.2)], fill=TEXT, width=max(int(1.5 * s), 1))
    draw.line([*P(5.8, 15.0), *P(9.0, 15.0)], fill=TEXT, width=max(int(1.5 * s), 1))
    draw.line([*P(14.4, 10.6), *P(20.0, 6.0)], fill=CYAN, width=max(int(1.6 * s), 1))
    r = 2.1 * s
    draw.ellipse([P(20.8 - 2.1, 5.4 - 2.1), P(20.8 + 2.1, 5.4 + 2.1)], fill=CYAN)


def make_icon(size: int, path: Path, padding_ratio: float = 0.0) -> None:
    canvas = Image.new("RGBA", (size * SS, size * SS), BG + (255,))
    draw = ImageDraw.Draw(canvas)
    inner = size * SS * (1 - 2 * padding_ratio)
    scale = inner / 24
    offset = (size * SS * padding_ratio, size * SS * padding_ratio)
    draw_mark(draw, scale, offset)
    canvas.resize((size, size), Image.LANCZOS).save(path, "PNG")
    print(f"  {path.name}  {size}x{size}")


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

    # mark + wordmark
    draw_mark(draw, 2.0, (left, 58))
    draw.text((left + 58, 66), "Local Server Exposer", font=font(28, bold=True), fill=TEXT)

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
        draw.rounded_rectangle([fx, fy, fx + target_w + 20, fy + shot.height + 20], radius=14, fill=SURFACE, outline=LINE, width=2)
        image.paste(frame, (fx, fy))

    draw.line([(left, 528), (width - 72, 528)], fill=LINE, width=1)
    small = fit_font(draw, "Windows 10 / 11 · x64      Free download      No telemetry", 1000, 22, bold=False)
    draw.text((left, 556), "Windows 10 / 11 · x64", font=small, fill=TEXT)
    x = left + int(draw.textlength("Windows 10 / 11 · x64", font=small)) + 42
    draw.text((x, 556), "Free download", font=small, fill=TEXT)
    x += int(draw.textlength("Free download", font=small)) + 42
    draw.text((x, 556), "No telemetry", font=small, fill=MUTED)

    image.save(path, "PNG")
    print(f"  {path.name}  1200x630")


def convert_screenshot(source: Path, target: Path, width: int, quality: int = 82, crop: tuple | None = None) -> None:
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
    make_icon(32, STATIC / "icon-32.png")
    make_icon(180, STATIC / "apple-touch-icon.png", padding_ratio=0.08)
    print("images:")
    make_og(STATIC / "og-image.png")
    convert_screenshot(SOURCE_SCREENSHOT, STATIC / "app-servers.webp", 1600)
    # Hero crop: the top-left region of the real screenshot, where the first
    # server cards sit. Cropping (rather than shrinking the whole window) keeps
    # the text readable at hero size without altering what the app shows.
    with Image.open(SOURCE_SCREENSHOT) as probe:
        w, h = probe.size
    convert_screenshot(
        SOURCE_SCREENSHOT,
        STATIC / "app-servers-hero.webp",
        1200,
        crop=(0, 0, int(w * 0.60), int(h * 0.72)),
    )
    if SOURCE_CONFIRM.exists():
        convert_screenshot(SOURCE_CONFIRM, STATIC / "app-confirm.webp", 1200)
    if SOURCE_APP_ICON.exists():
        convert_screenshot(SOURCE_APP_ICON, STATIC / "app-icon.webp", 192, quality=88)
    for source, target, width in (
        (SOURCE_TUNNEL, "app-tunnel.webp", 1200),
        (SOURCE_TUNNELS_PAGE, "app-tunnels.webp", 1200),
        (SOURCE_SETTINGS, "app-settings.webp", 1200),
    ):
        if source.exists():
            convert_screenshot(source, STATIC / target, width)


if __name__ == "__main__":
    main()