# Daily Smart Book Ramadan - Design Guidelines

## Overview
Modern Islamic educational platform for monitoring Ramadan activities, journals, and student worship tracking with an elegant emerald green, gold, and cream aesthetic.

## Design System

### Color Palette

**Primary Colors**
- Primary Green: `#059669` (Emerald 600) - Main brand color, CTAs, active states
- Dark Green: `#1a4d2e` - Text, headings, strong emphasis
- Gold/Accent: `#d4af37` - Highlights, achievements, special elements

**Neutral Colors**
- Background: `#fdfbf7` - Warm cream background
- Card: `#ffffff` - Pure white for cards and surfaces
- Muted: `#f5f3ef` - Subtle backgrounds
- Border: `rgba(5, 150, 105, 0.12)` - Soft emerald borders

### Typography

**Font Families**
- **Headings & Arabic**: 'Amiri' (serif) - Elegant, traditional Islamic aesthetic
- **Body & UI**: 'Cairo' (sans-serif) - Modern, readable Arabic-Latin font
- **Fallback**: 'Inter' for Latin text

**Font Scale**
- Display: 3xl-5xl for heroes and major headings
- Headings: xl-2xl
- Body: base (16px)
- Small: sm-xs for captions

### Spacing & Layout

**Border Radius**
- Cards: `rounded-3xl` (1.5rem)
- Buttons: `rounded-xl` (0.75rem)
- Small elements: `rounded-lg` (0.5rem)

**Shadows**
- Default card: `shadow-lg`
- Hover state: `shadow-xl`
- Featured: `shadow-2xl`
- Colored: `shadow-lg shadow-primary/30`

### Islamic Design Elements

**Patterns & Ornaments**
- Geometric Islamic patterns (2% opacity overlay)
- Mosque silhouettes for backgrounds
- Crescent moon and stars as brand elements
- Lantern illustrations for Ramadan

### Components

**Cards**
- Background: White
- Border: Subtle emerald
- Rounded: `rounded-3xl`
- Shadow: `shadow-lg`
- Hover: `hover:shadow-xl transition-all`

**Buttons**
- Primary: Emerald with white text
- Secondary: Light green background
- Rounded: `rounded-xl`
- Shadow on primary: `shadow-lg shadow-primary/30`

**Navigation**
- Fixed sidebar (white)
- Active: Primary green with shadow
- Hover: Secondary background
- Lucide React icons

### Page Structure

**Student Pages**: Dashboard, Journal, Tracker, Prayer, Materials, Quiz, Reports, Profile

**Teacher Pages**: Dashboard, Student Management, Journal Monitoring, Tracker Monitoring, Material Management, Quiz Management, Reports

### Responsive Design

- Mobile: < 768px
- Tablet: 768px - 1024px  
- Desktop: > 1024px

### Voice & Tone

- Respectful and encouraging
- Islamic terminology used correctly
- Bilingual support (Arabic-Indonesian)
- Student-friendly, motivational

### Icons & Assets

- Lucide React for all UI icons
- Islamic symbols: Moon, Star, Sparkles
- Unsplash for photos
- Custom Islamic geometric patterns
