Original prompt: Can you add the summonpage.png to the background of the summon page and the homepage.png to the home page on the app. Try to make the scaling images fit well, make design changes that you would believe would work best

- Located relevant pages: src/app/home/page.tsx and src/app/summon/page.tsx.
- Confirmed assets exist: public/homepage.png and public/summonpage.png.
- Plan: replace gradient page backgrounds with image backgrounds, add contrast overlays, and tune responsive positioning/spacing for readability.
- Implemented image backgrounds:
  - Home uses `/homepage.png` with `bg-cover bg-center` and layered dark gradients for text contrast.
  - Summon uses `/summonpage.png` with `bg-cover bg-center` and medium-screen offset positioning plus side-vignette overlays.
- Updated content card surfaces to darker translucent gradients so foreground text remains readable over artwork.
- Validation:
  - `npm run lint` passed.
  - Installed Playwright Chromium and ran skill client captures for `/home` and `/summon` into `output/web-game-home` and `output/web-game-summon`.
  - Both captures redirect to Auth0 login in this environment, so direct visual verification of in-app background pages was blocked by authentication.
- Note: `package.json` and `package-lock.json` include Playwright dependency updates from setup.
- Cleaned temporary local validation artifacts (`output/`, `web_game_playwright_client.local.js`) after verification run.
