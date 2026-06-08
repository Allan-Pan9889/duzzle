import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import {
  HOME_DEMO_IMAGE_PATHS,
  HOME_DEMO_IMAGE_SOURCES,
  MYNT_REFERER,
} from "./demo-fashion-images";

const IMAGE_DIR = join(process.cwd(), "public", "demo", "home");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function downloadImage(url: string, destPath: string): boolean {
  try {
    execFileSync(
      "curl",
      [
        "-fsSL",
        "--max-time",
        "30",
        "--retry",
        "3",
        "--retry-delay",
        "1",
        "-H",
        `User-Agent: ${USER_AGENT}`,
        "-H",
        `Referer: ${MYNT_REFERER}`,
        "-o",
        destPath,
        url,
      ],
      { stdio: "pipe" },
    );
    return statSync(destPath).size > 1024;
  } catch {
    return false;
  }
}

function main(): void {
  mkdirSync(IMAGE_DIR, { recursive: true });

  const jobs = Object.entries(HOME_DEMO_IMAGE_SOURCES) as Array<
    [keyof typeof HOME_DEMO_IMAGE_SOURCES, string]
  >;

  console.log(`Downloading ${jobs.length} homepage images...\n`);

  let ok = 0;
  for (const [key, url] of jobs) {
    const filename = HOME_DEMO_IMAGE_PATHS[key].replace("/demo/home/", "");
    const destPath = join(IMAGE_DIR, filename);
    if (downloadImage(url, destPath)) {
      console.log(`  ✓ ${filename}`);
      ok++;
    } else {
      console.log(`  ✗ ${filename}`);
    }
  }

  console.log(`\nDone. ${ok}/${jobs.length} images saved to public/demo/home/`);
}

main();
