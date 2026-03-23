# TrustLedger Pitch Deck

Generates a 10-slide seed investor pitch deck as a PDF.

## Usage

```bash
# Install dependencies (one-time)
cd docs/pitch-deck
npm install

# Generate the PDF
node generate.js
# → outputs trustledger-pitch-deck.pdf in this directory
```

## Editing

Edit `slides.html` to update slide content. All CSS is in the `<style>` block at the top of that file.

## Placeholders

Before sending to investors, fill in the following in `slides.html`:

| Slide | What to fill |
|-------|-------------|
| Slide 2 | `$X B` — AI governance market size (add source) |
| Slide 6 | `$X B` / `$X B` / `$X M` — TAM/SAM/SOM figures with citations |
| Slide 7 | `[demo URL]` — live demo link |
| Slide 9 | `[Founder Name]`, 3 credential bullets, why-me sentence |
| Slide 10 | `[Founder Name]`, `[email@domain.com]`, `[trustledger.io]` |
