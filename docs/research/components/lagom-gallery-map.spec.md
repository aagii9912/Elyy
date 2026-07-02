# Lagom — Interior gallery + Location/Map (reference for FinalGallery + FinalMap)

Sources: https://lagom-development.com/lagom/ (gallery), https://lagom-development.com/unique/ (map)

## Gallery ("Простір, що надихає")
- **16 slides**, each large **3:2 landscape** (~1026×684). One big image with a **peek** of the next.
- Horizontal Swiper, drag + arrows, `ease` timing. Big cinematic interior photos, not a small marquee.
- => Replace our two-row portrait marquee with a large-landscape peeking carousel (perView ~1.3–1.6, one hero image + peek).

## Location/Map ("Міська інфраструктура")
- Large interactive **Mapbox** map, full-width, ~800px tall (`.container-map`).
- Elsewhere: full-bleed aerial images with a **translucent grey caption card** overlaid bottom-right (description text).
- => Our adaptation (no Mapbox token): enlarge the map, overlay a translucent caption card with nearby-landmark list + a "Get directions" link. Keep Google embed but full-bleed & taller.

## Notes
- Lagom pages are heavily pinned/lazy — extraction via DOM. Palette light/cream with orange accent (we keep our green/charcoal brand).
