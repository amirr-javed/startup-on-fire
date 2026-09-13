import { expect, test, type Page } from "@playwright/test";

async function enterFireCity(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Startup on Fire" })).toBeVisible();
  await expect(page.getByText("Fire is earned, never bought.")).toBeVisible();
  const enterButton = page.getByRole("button", { name: "Enter Fire City" });
  await expect(enterButton).toBeFocused();
  await enterButton.click();
  await expect(page.getByRole("button", { name: "How does fire work?" })).toBeFocused();
}

async function finishOnboarding(page: Page): Promise<void> {
  await page.getByRole("button", { name: "How does fire work?" }).click();
  await expect(page.getByRole("heading", { name: "Fire is earned, never bought" })).toBeVisible();
  await page.getByRole("button", { name: "Start scouting" }).click();
  await expect(page.locator("canvas")).toBeVisible();
}

async function waitForE2eDriver(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__SOF_E2E__ !== undefined);
}

test.afterEach(async ({ page }) => {
  if (!page.isClosed()) {
    await page.evaluate(() => window.dispatchEvent(new Event("beforeunload")));
  }
});

test("guest launch and onboarding keep the world immediately accessible", async ({
  page,
}, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await enterFireCity(page);
  await expect(page.getByLabel("Scout status")).toContainText("Booths discovered 0/3");
  await finishOnboarding(page);
  await waitForE2eDriver(page);

  const before = await page.evaluate(() => window.__SOF_E2E__!.scoutPosition());
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(300);
  await page.keyboard.up("ArrowRight");
  const after = await page.evaluate(() => window.__SOF_E2E__!.scoutPosition());
  expect(after.x).toBeGreaterThan(before.x);

  if (testInfo.project.name === "mobile-landscape-chromium") {
    await expect(page.getByRole("region", { name: "Movement controls" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Move left" })).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});

test("@live completes a server-protected Kindred quest in a clean browser", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One live run is sufficient.");

  await enterFireCity(page);
  const status = page.getByLabel("Scout status");
  await expect(status).toContainText("Live booth feed connected", { timeout: 30_000 });
  await expect(status).not.toContainText("Game update pending");
  await finishOnboarding(page);
  await waitForE2eDriver(page);
  await page.evaluate(() => window.__SOF_E2E__!.approachBooth("kindred-labs"));

  const interact = page.getByRole("button", { name: "Interact · E" });
  await expect(interact).toBeVisible();
  await expect(page.locator(".interaction-prompt")).toContainText(
    /Meet .* at (Kindred Labs|Kindred Protocol)/,
  );
  await interact.click();

  await expect(page.getByRole("button", { name: "Tell me more" })).toBeVisible();
  await page.getByRole("button", { name: "Tell me more" }).click();
  await expect(page.getByRole("heading", { name: "The launch board is crawling" })).toBeVisible();
  await page.getByRole("button", { name: "Start Bug Squash" }).click();

  await expect(page.getByRole("heading", { name: "Bug Squash" })).toBeVisible();
  const squashButton = page.getByRole("button", { name: "Squash target · Space" });
  await expect(squashButton).toBeVisible();
  const result = await page.evaluate(
    () =>
      new Promise<{ status: string | undefined; score: number }>((resolve) => {
        const started = performance.now();
        const interval = window.setInterval(() => {
          const card = document.querySelector<HTMLElement>(".story-card");
          const status = card?.dataset.status;
          const score = Number(card?.querySelector<HTMLProgressElement>("progress")?.value ?? 0);
          if (
            status === "success" ||
            status === "failed" ||
            status === "error" ||
            performance.now() - started > 35_000
          ) {
            window.clearInterval(interval);
            resolve({ status, score });
            return;
          }
          window.__SOF_E2E__!.squashActiveBug();
        }, 150);
      }),
  );
  expect(result).toEqual({ status: "success", score: 8 });

  await expect(page.getByRole("heading", { name: "Release board cleared!" })).toBeVisible();
  await expect(page.getByText("server-saved Practice Spark")).toBeVisible();
  await expect(page.getByRole("button", { name: "Return to Maya" })).toBeVisible();
});
