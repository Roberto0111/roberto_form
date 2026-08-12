#!/usr/bin/env python3
"""Render the bath towel hooks launch Reel with original ambient audio."""

from __future__ import annotations

from array import array
import math
from pathlib import Path
import shutil
import subprocess
import wave


SAMPLE_RATE = 48_000
DURATION = 10.0


def smooth_envelope(local_time: float, length: float, attack: float, release: float) -> float:
    if local_time < 0.0 or local_time >= length:
        return 0.0
    if local_time < attack:
        return math.sin((math.pi / 2.0) * (local_time / attack)) ** 2
    remaining = length - local_time
    if remaining < release:
        return math.sin((math.pi / 2.0) * (remaining / release)) ** 2
    return 1.0


def synthesize_soundtrack(path: Path) -> None:
    total = int(SAMPLE_RATE * DURATION)
    left = array("f", [0.0]) * total
    right = array("f", [0.0]) * total

    chords = [
        (0.0, (146.83, 174.61, 220.00, 293.66)),
        (2.5, (130.81, 164.81, 220.00, 261.63)),
        (5.0, (116.54, 146.83, 196.00, 246.94)),
        (7.5, (130.81, 196.00, 246.94, 293.66)),
    ]
    for chord_index, (start, notes) in enumerate(chords):
        first = int(start * SAMPLE_RATE)
        last = min(total, int((start + 3.0) * SAMPLE_RATE))
        for sample_index in range(first, last):
            t = sample_index / SAMPLE_RATE
            local = t - start
            envelope = smooth_envelope(local, 3.0, 0.85, 1.0)
            l_value = 0.0
            r_value = 0.0
            for voice_index, frequency in enumerate(notes):
                phase = chord_index * 0.23 + voice_index * 0.19
                tone = math.sin(2.0 * math.pi * frequency * t + phase)
                tone += 0.18 * math.sin(2.0 * math.pi * frequency * 2.0 * t + phase)
                value = tone * envelope * 0.024
                pan = 0.30 + (voice_index / max(1, len(notes) - 1)) * 0.40
                l_value += value * math.sqrt(1.0 - pan)
                r_value += value * math.sqrt(pan)
            left[sample_index] += l_value
            right[sample_index] += r_value

    for note_index, frequency in enumerate((293.66, 349.23, 440.00, 523.25) * 4):
        start = 0.45 + note_index * 0.55
        first = int(start * SAMPLE_RATE)
        last = min(total, int((start + 1.15) * SAMPLE_RATE))
        pan = 0.42 if note_index % 2 == 0 else 0.58
        for sample_index in range(first, last):
            local = sample_index / SAMPLE_RATE - start
            pluck = math.exp(-3.35 * local) * min(1.0, local / 0.02)
            value = math.sin(2.0 * math.pi * frequency * local) * pluck * 0.043
            left[sample_index] += value * math.sqrt(1.0 - pan)
            right[sample_index] += value * math.sqrt(pan)

    dry_left = array("f", left)
    dry_right = array("f", right)
    for delay_seconds, gain in ((0.19, 0.17), (0.38, 0.10)):
        delay = int(delay_seconds * SAMPLE_RATE)
        for sample_index in range(delay, total):
            left[sample_index] += dry_right[sample_index - delay] * gain
            right[sample_index] += dry_left[sample_index - delay] * gain

    peak = 0.0
    for sample_index in range(total):
        t = sample_index / SAMPLE_RATE
        envelope = min(1.0, t / 0.55) * min(1.0, max(0.0, (DURATION - t) / 0.9))
        left[sample_index] *= envelope
        right[sample_index] *= envelope
        peak = max(peak, abs(left[sample_index]), abs(right[sample_index]))

    gain = 0.52 / peak if peak else 1.0
    pcm = array("h")
    for sample_index in range(total):
        pcm.append(int(max(-1.0, min(1.0, left[sample_index] * gain)) * 32767))
        pcm.append(int(max(-1.0, min(1.0, right[sample_index] * gain)) * 32767))

    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(pcm.tobytes())


def render_reel(image_path: Path, audio_path: Path, output_path: Path) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required to render the Reel")

    filter_complex = (
        "[0:v]scale=2560:1920,format=yuv420p,split=3[left][middle][right];"
        "[left]crop=1080:1920:0:0,trim=duration=3.2,setpts=PTS-STARTPTS,"
        "zoompan=z='min(zoom+0.00022,1.025)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        "d=96:s=1080x1920:fps=30[v0];"
        "[middle]crop=1080:1920:740:0,trim=duration=3.2,setpts=PTS-STARTPTS,"
        "zoompan=z='min(zoom+0.00018,1.021)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        "d=96:s=1080x1920:fps=30[v1];"
        "[right]crop=1080:1920:1480:0,trim=duration=3.6,setpts=PTS-STARTPTS,"
        "zoompan=z='min(zoom+0.0002,1.024)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        "d=108:s=1080x1920:fps=30[v2];"
        "[v0][v1]xfade=transition=fade:duration=0.35:offset=2.85[v01];"
        "[v01][v2]xfade=transition=fade:duration=0.35:offset=5.7,"
        "fade=t=in:st=0:d=0.35,fade=t=out:st=9.3:d=0.7[v]"
    )
    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "warning",
        "-y",
        "-loop",
        "1",
        "-framerate",
        "30",
        "-i",
        str(image_path),
        "-i",
        str(audio_path),
        "-filter_complex",
        filter_complex,
        "-map",
        "[v]",
        "-map",
        "1:a:0",
        "-t",
        str(DURATION),
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ar",
        str(SAMPLE_RATE),
        "-movflags",
        "+faststart",
        str(output_path),
    ]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(command, check=True)


def main() -> None:
    here = Path(__file__).resolve().parent
    root = here.parents[2]
    image_path = root / "public" / "lifestyle" / "bath-towel-hook-scenes.webp"
    audio_path = here / "13-bath-towel-hooks-original-ambient.wav"
    output_path = here / "13-bath-towel-hooks-reel.mp4"
    synthesize_soundtrack(audio_path)
    render_reel(image_path, audio_path, output_path)
    print(output_path)


if __name__ == "__main__":
    main()
