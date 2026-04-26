"""Download specific Notion S3 assets before signed URLs expire (~1 hour).

Round-6 asset salvage. Pulls real gameplay GIFs + storyboard for
a-game-of-deterioration from David's Notion portfolio page.
"""
from __future__ import annotations

import sys
import urllib.request
from pathlib import Path

ROOT = Path(r"W:\tianle-chen-site")
ASSETS = ROOT / "public" / "assets"

# (slug, filename, url)
DOWNLOADS = [
    (
        "a-game-of-deterioration",
        "gameplay-terrain-editor.gif",
        "https://prod-files-secure.s3.us-west-2.amazonaws.com/ef69813d-5b0d-4465-ae10-f770f962d7d9/2cd4d6b8-c1f9-48a5-b135-a9eb0adc3071/Untitled-video-_10_.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466QC6OG26G%2F20260426%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260426T192112Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIGvo1ZmAusDRjqodyJFFMNxqVUfKvMFyuMV%2F6tZFDtf6AiBZE%2FHw6G8YhZ4pYcXPW8jVwkSuFai8xvDL7Qgl8krh6iqIBAi0%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMkhRiewkE8yYLupxaKtwD3Pu6fh8NQmb0sZ4%2BeNjABPtVVcxP0DDyxIPuYpYskyuzvC3S%2BLM1dAu2m4H6LHOo8Z3zqgSUGU0xMDnmFheFu38S7QKq3XZDffxHpdHHod7Jfrrg3wf3Zkk7omxs6o8DxSON6mCf6%2FkSEtxiF1rQzprpe2mS1NQTjVRCL3KcnlttLgJgcG%2BCUmTKuJKV%2Fsp6MfVKEts%2BCSlBFRqoJx1nlZtVZcIjIH2WZ5VF7V%2BcAGvFKUdVPsCLNvswK%2FEA%2FZaq0pqcS13z4m86x%2BXd%2B9YZOK5RUnO8Y8f%2Fdnpyb49XGbSPDWBtKC2qpgwsqsm%2FITapkmcdysOXHnpHhfLcksH8Ifj16Phjcpe%2F82%2BI%2F6yss5qee0WU6qFazc84Eduj1JaBIC2LjanZmb3G8PcAYLPMZj2GOayN%2FO2TO9uH74iGhQLIQnvicIZFh%2BCRnXY7SXlqGczjpw%2BbLp4QiVq3nwkJBnKLU%2B9sTCS2f4agjfFnaTGAav6rMB47YUy5mfCq%2FRbkGjLOwCKeZhlVKf8Ivq7qo1N4GlPvCFq9ZS9HU40ED3NOB%2BCLV8XX%2B7llT%2BbJ%2F65NxWsZN5SDJWzslrQxpdoYNfU%2F9QcFYuK0LGe7kTGbxPwcZkPLuf3XOf8w%2BxwwhMa5zwY6pgFowwzvohgWcttzaWcXyNAf3hZjcrzntFbT%2FeIaGc5neoqc5i6N50NSgF1JUWz5faZgcTMwb6mhNfCpP%2FgU4J9oBshuZd8s7%2Ft%2FR8GOGsGk696TttxHTFQbZORBurFHEsxmqvrvlKBojR19rffcHdWcnpB%2B2bqVfJNLoBEOb4GihdbIeCTx0Vg7zTRHy%2Fdg1dYqTwPrZRWd7S3vKa37FbhQLRoy3bc3&X-Amz-Signature=0ed57b8e240c805d5de5d1322a8e7488d4dd816b252a9aeeb2af0ee6ea1ffae1&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    ),
    (
        "a-game-of-deterioration",
        "gameplay-deterioration-restoration.gif",
        "https://prod-files-secure.s3.us-west-2.amazonaws.com/ef69813d-5b0d-4465-ae10-f770f962d7d9/c4354075-b225-471f-b748-7c3b22f7db94/Untitled-video-_11_.gif?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466QC6OG26G%2F20260426%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260426T192112Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIGvo1ZmAusDRjqodyJFFMNxqVUfKvMFyuMV%2F6tZFDtf6AiBZE%2FHw6G8YhZ4pYcXPW8jVwkSuFai8xvDL7Qgl8krh6iqIBAi0%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMkhRiewkE8yYLupxaKtwD3Pu6fh8NQmb0sZ4%2BeNjABPtVVcxP0DDyxIPuYpYskyuzvC3S%2BLM1dAu2m4H6LHOo8Z3zqgSUGU0xMDnmFheFu38S7QKq3XZDffxHpdHHod7Jfrrg3wf3Zkk7omxs6o8DxSON6mCf6%2FkSEtxiF1rQzprpe2mS1NQTjVRCL3KcnlttLgJgcG%2BCUmTKuJKV%2Fsp6MfVKEts%2BCSlBFRqoJx1nlZtVZcIjIH2WZ5VF7V%2BcAGvFKUdVPsCLNvswK%2FEA%2FZaq0pqcS13z4m86x%2BXd%2B9YZOK5RUnO8Y8f%2Fdnpyb49XGbSPDWBtKC2qpgwsqsm%2FITapkmcdysOXHnpHhfLcksH8Ifj16Phjcpe%2F82%2BI%2F6yss5qee0WU6qFazc84Eduj1JaBIC2LjanZmb3G8PcAYLPMZj2GOayN%2FO2TO9uH74iGhQLIQnvicIZFh%2BCRnXY7SXlqGczjpw%2BbLp4QiVq3nwkJBnKLU%2B9sTCS2f4agjfFnaTGAav6rMB47YUy5mfCq%2FRbkGjLOwCKeZhlVKf8Ivq7qo1N4GlPvCFq9ZS9HU40ED3NOB%2BCLV8XX%2B7llT%2BbJ%2F65NxWsZN5SDJWzslrQxpdoYNfU%2F9QcFYuK0LGe7kTGbxPwcZkPLuf3XOf8w%2BxwwhMa5zwY6pgFowwzvohgWcttzaWcXyNAf3hZjcrzntFbT%2FeIaGc5neoqc5i6N50NSgF1JUWz5faZgcTMwb6mhNfCpP%2FgU4J9oBshuZd8s7%2Ft%2FR8GOGsGk696TttxHTFQbZORBurFHEsxmqvrvlKBojR19rffcHdWcnpB%2B2bqVfJNLoBEOb4GihdbIeCTx0Vg7zTRHy%2Fdg1dYqTwPrZRWd7S3vKa37FbhQLRoy3bc3&X-Amz-Signature=97dc873c8708d4ba237898ad36c3f855687be02c12e6093acbc918a62a112c61&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    ),
    (
        "a-game-of-deterioration",
        "story-board.jpg",
        "https://prod-files-secure.s3.us-west-2.amazonaws.com/ef69813d-5b0d-4465-ae10-f770f962d7d9/30688d91-34d9-418f-aae0-e86d2b3db4e8/story_board.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZI2LB466QC6OG26G%2F20260426%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20260426T192112Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCIGvo1ZmAusDRjqodyJFFMNxqVUfKvMFyuMV%2F6tZFDtf6AiBZE%2FHw6G8YhZ4pYcXPW8jVwkSuFai8xvDL7Qgl8krh6iqIBAi0%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDYzNzQyMzE4MzgwNSIMkhRiewkE8yYLupxaKtwD3Pu6fh8NQmb0sZ4%2BeNjABPtVVcxP0DDyxIPuYpYskyuzvC3S%2BLM1dAu2m4H6LHOo8Z3zqgSUGU0xMDnmFheFu38S7QKq3XZDffxHpdHHod7Jfrrg3wf3Zkk7omxs6o8DxSON6mCf6%2FkSEtxiF1rQzprpe2mS1NQTjVRCL3KcnlttLgJgcG%2BCUmTKuJKV%2Fsp6MfVKEts%2BCSlBFRqoJx1nlZtVZcIjIH2WZ5VF7V%2BcAGvFKUdVPsCLNvswK%2FEA%2FZaq0pqcS13z4m86x%2BXd%2B9YZOK5RUnO8Y8f%2Fdnpyb49XGbSPDWBtKC2qpgwsqsm%2FITapkmcdysOXHnpHhfLcksH8Ifj16Phjcpe%2F82%2BI%2F6yss5qee0WU6qFazc84Eduj1JaBIC2LjanZmb3G8PcAYLPMZj2GOayN%2FO2TO9uH74iGhQLIQnvicIZFh%2BCRnXY7SXlqGczjpw%2BbLp4QiVq3nwkJBnKLU%2B9sTCS2f4agjfFnaTGAav6rMB47YUy5mfCq%2FRbkGjLOwCKeZhlVKf8Ivq7qo1N4GlPvCFq9ZS9HU40ED3NOB%2BCLV8XX%2B7llT%2BbJ%2F65NxWsZN5SDJWzslrQxpdoYNfU%2F9QcFYuK0LGe7kTGbxPwcZkPLuf3XOf8w%2BxwwhMa5zwY6pgFowwzvohgWcttzaWcXyNAf3hZjcrzntFbT%2FeIaGc5neoqc5i6N50NSgF1JUWz5faZgcTMwb6mhNfCpP%2FgU4J9oBshuZd8s7%2Ft%2FR8GOGsGk696TttxHTFQbZORBurFHEsxmqvrvlKBojR19rffcHdWcnpB%2B2bqVfJNLoBEOb4GihdbIeCTx0Vg7zTRHy%2Fdg1dYqTwPrZRWd7S3vKa37FbhQLRoy3bc3&X-Amz-Signature=29be700f0d12ebfd7a82c6c23cfeaed6d7fd0c680e464fe9294f213a2583bd07&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    ),
]


def main() -> None:
    for slug, filename, url in DOWNLOADS:
        out = ASSETS / slug / filename
        out.parent.mkdir(parents=True, exist_ok=True)
        if out.exists():
            print(f"[skip] {out.relative_to(ROOT)} already exists ({out.stat().st_size:,} bytes)")
            continue
        print(f"[fetch] {slug}/{filename}")
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (asset-salvage)"},
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            out.write_bytes(data)
            print(f"  -> {len(data):,} bytes")
        except Exception as e:
            print(f"  ERROR: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
