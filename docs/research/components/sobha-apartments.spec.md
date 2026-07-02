# Sobha One — Floor Plan / unit selector (reference for FinalApartments)

Source: https://sobharealty.com/properties-in-dubai/sobha-one  (section "Floor Plan", y≈3734)

## Structure
- Heading "Floor Plan" + bedroom-count tabs (1/2/3/4 Bedroom) that FILTER the set.
- Within a bedroom count: **Swiper horizontal carousel** of unit types (Type A / B / C…).
- Each unit card: **text specs ABOVE** (type name, suite area, balcony, total sq.ft.), floor-plan image BELOW.
- Prev/Next arrows + "Walkthrough" link per card.

## Interaction model
- Click bedroom tab → filters carousel to that count.
- Horizontal drag/arrows within a count.

## Already implemented in /final FinalApartments
- Swiper carousel ✓, 1/2/3/4 өрөө tabs that jump to slide ✓, count+area on top / axono image below ✓.

## Refinement opportunities
- Add prev/next arrows (currently pagination dots only).
- Ensure specs sit clearly ABOVE the image (title + м² row already above image ✓).
