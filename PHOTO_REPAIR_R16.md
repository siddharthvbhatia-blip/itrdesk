# Final profile portrait repair (R16)

This repair replaces the pale placeholder asset with a verified photographic JPEG and removes every source that could restore the placeholder.

Safeguards:

- Unique final asset filename: `assets/ca-siddharth-bhatia-final-r16.jpg`
- Direct About-page references with cache version `20260717-r16`
- Shared JavaScript and recovery runtime use the same asset
- CSS-level `content` fallback covers every profile portrait slot
- Independent raw GitHub fallback
- Static source regression test
- Pillow photographic-content test to reject pale placeholders
- Chromium tests for decoded pixels, circular geometry, correct LinkedIn link and non-overlapping mobile layout
- Post-deployment public-site smoke test
