#!/usr/bin/env python3
"""Render the first ROBERT FORM / Radish Studio launch image as a 9:16 Reel.

The soundtrack is generated locally from simple synthesized tones, so it does
not depend on Instagram's licensed music catalogue or third-party audio files.
"""

from __future__ import annotations

import argparse
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

    # Cmaj7 -> Am7 -> Fmaj7 -> G6, voiced softly in the lower register.
    chords = [
        (0.0, (130.81, 164.81, 196.00, 246.94)),
        (2.4, (110.00, 164.81, 196.00, 261.63)),
        (4.8, (87.31, 130.81, 164.81, 220.00)),
        (7.2, (98.00, 146.83, 164.81, 246.94)),
    ]
    chord_length = 3.25
    for chord_index, (start, notes) in enumerate(chords):
        first = int(start * SAMPLE_RATE)
        last = min(total, int((start + chord_length) * SAMPLE_RATE))
        for sample_index in range(first, last):
            t = sample_index / SAMPLE_RATE
            local = t - start
            envelope = smooth_envelope(local, chord_length, 0.75, 0.9)
            if envelope == 0.0:
                continue
            l_value = 0.0
            r_value = 0.0
            for voice_index, frequency in enumerate(notes):
                phase = (chord_index * 0.31) + (voice_index * 0.17)
                fundamental = math.sin(2.0 * math.pi * frequency * t + phase)
                overtone = 0.22 * math.sin(2.0 * math.pi * frequency * 2.0 * t + phase * 0.7)
                voice = (fundamental + overtone) * 0.026 * envelope
                pan = 0.32 + (voice_index / max(1, len(notes) - 1)) * 0.36
                l_value += voice * math.sqrt(1.0 - pan)
                r_value += voice * math.sqrt(pan)
            left[sample_index] += l_value
            right[sample_index] += r_value

    # A sparse, music-box-like arpeggio adds motion without becoming busy.
    arpeggios = [
        (261.63, 329.63, 392.00, 493.88),
        (220.00, 261.63, 329.63, 392.00),
        (174.61, 220.00, 261.63, 329.63),
        (196.00, 246.94, 329.63, 392.00),
    ]
    note_interval = 0.6
    note_length = 1.35
    note_count = int(DURATION / note_interval) + 1
    for note_index in range(note_count):
        start = note_index * note_interval
        chord_index = min(3, int(start / 2.4))
        frequency = arpeggios[chord_index][note_index % 4]
        first = int(start * SAMPLE_RATE)
        last = min(total, int((start + note_length) * SAMPLE_RATE))
        pan = 0.38 if note_index % 2 == 0 else 0.62
        for sample_index in range(first, last):
            local = (sample_index / SAMPLE_RATE) - start
            pluck = math.exp(-3.1 * local) * min(1.0, local / 0.018)
            tone = (
                math.sin(2.0 * math.pi * frequency * local)
                + 0.46 * math.sin(2.0 * math.pi * frequency * 2.0 * local)
                + 0.15 * math.sin(2.0 * math.pi * frequency * 3.0 * local)
            )
            value = tone * pluck * 0.055
            left[sample_index] += value * math.sqrt(1.0 - pan)
            right[sample_index] += value * math.sqrt(pan)

    # Gentle stereo delay creates a small-room ambience.
    dry_left = array("f", left)
    dry_right = array("f", right)
    for delay_seconds, gain in ((0.17, 0.20), (0.31, 0.13), (0.49, 0.08)):
        delay = int(delay_seconds * SAMPLE_RATE)
        for sample_index in range(delay, total):
            left[sample_index] += dry_right[sample_index - delay] * gain
            right[sample_index] += dry_left[sample_index - delay] * gain

    # Fade the complete piece and normalize conservatively for social playback.
    peak = 0.0
    for sample_index in range(total):
        t = sample_index / SAMPLE_RATE
        fade_in = min(1.0, t / 0.45)
        fade_out = min(1.0, max(0.0, (DURATION - t) / 0.85))
        envelope = fade_in * fade_out
        left[sample_index] *= envelope
        right[sample_index] *= envelope
        peak = max(peak, abs(left[sample_index]), abs(right[sample_index]))

    # About -16 LUFS after AAC encoding: audible on phones while remaining soft.
    gain = 0.55 / peak if peak else 1.0
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
        "[0:v]split=2[bg][fg];"
        "[bg]scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920,gblur=sigma=42,eq=brightness=-0.11:saturation=0.82[bg2];"
        "[fg]scale=1080:-2[fg2];"
        "[bg2][fg2]overlay=(W-w)/2:(H-h)/2,format=yuv420p,"
        "zoompan=z='min(max(zoom,pzoom)+0.00012,1.036)':"
        "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,"
        "fade=t=in:st=0:d=0.55,fade=t=out:st=9.25:d=0.75[v]"
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
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
    subprocess.run(command, check=True)


def main() -> None:
    here = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=Path, default=here / "01-brand-intro.png")
    parser.add_argument("--audio", type=Path, default=here / "01-brand-intro-original-ambient.wav")
    parser.add_argument("--output", type=Path, default=here / "01-brand-intro-reel.mp4")
    args = parser.parse_args()

    synthesize_soundtrack(args.audio)
    render_reel(args.image, args.audio, args.output)
    print(args.output)


if __name__ == "__main__":
    main()
