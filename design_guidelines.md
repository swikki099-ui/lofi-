# Lofi Music Web App - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from premium music streaming platforms like Spotify, YouTube Music, and Apple Music, adapted for a lofi aesthetic with modern glassmorphic elements.

**Core Principles**:
- Immersive visual experience with video backgrounds
- Distraction-free music control interface
- Atmospheric glassmorphic UI that complements the background
- Smooth, subtle interactions without overwhelming the user

---

## Color Palette

### Dark Theme (Default)
- **Background**: Video overlay with 0 0% 0% / 40% dark scrim
- **Panel Background**: 0 0% 10% / 15% (glassmorphic base)
- **Panel Border**: 0 0% 100% / 10%
- **Primary Text**: 0 0% 98%
- **Secondary Text**: 0 0% 75%
- **Accent (Active States)**: 280 65% 65% (soft purple for music context)
- **Control Backgrounds**: 0 0% 100% / 8%
- **Hover States**: 0 0% 100% / 12%

### Light Theme
- **Background**: Video overlay with 0 0% 100% / 35% light scrim
- **Panel Background**: 0 0% 98% / 20% (glassmorphic base)
- **Panel Border**: 0 0% 0% / 8%
- **Primary Text**: 0 0% 10%
- **Secondary Text**: 0 0% 35%
- **Accent (Active States)**: 280 70% 55%
- **Control Backgrounds**: 0 0% 0% / 5%
- **Hover States**: 0 0% 0% / 8%

---

## Typography

**Font Family**: 
- Primary: 'Inter' (Google Fonts) for UI elements
- Display: 'Outfit' (Google Fonts) for headers and prominent text

**Type Scale**:
- App Title: text-3xl font-bold (Outfit)
- Section Headers: text-xl font-semibold (Outfit)
- Now Playing: text-lg font-medium (Inter)
- Body/Controls: text-sm font-normal (Inter)
- Labels: text-xs font-medium uppercase tracking-wide (Inter)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8, 12, 16

**Panel Structure**:
- Desktop: Fixed 480px left panel with h-screen
- Mobile: Full-width panel with max-h-[70vh] bottom sheet style
- Panel Padding: p-6 on desktop, p-4 on mobile
- Internal Spacing: space-y-6 between major sections, space-y-4 for controls

**Glassmorphism Effects**:
- Backdrop Blur: backdrop-blur-2xl
- Panel Background: Apply rgba with 15-20% opacity
- Border: 1px solid with 10% white opacity
- Shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37)

---

## Component Library

### Music Player Controls
- **Search Input**: Rounded-xl with backdrop-blur-lg, border with 10% opacity, px-4 py-3
- **Suggestion Dropdown**: Absolute positioned below input, same glassmorphic style, rounded-lg
- **Modal**: Full-screen overlay with centered content (max-w-2xl), backdrop-blur-xl background
- **Play/Pause Button**: Large circular button (w-14 h-14), primary accent background, centered icon
- **Next/Previous**: Smaller circular buttons (w-10 h-10), subtle background with 8% opacity
- **Volume Slider**: Custom styled range input with accent track, h-1 rounded-full

### Radio Station Selector
- **Dropdown**: Full-width select with glassmorphic background, rounded-lg, px-4 py-3
- **Station Items**: Display station name + genre subtitle in two-line format
- **Active Indicator**: Subtle accent border on selected station

### Visualizer
- **Canvas Container**: w-full aspect-[3/1], rounded-lg, positioned above background controls
- **Bar Styling**: Gradient bars from accent to transparent, 40-60 bars total
- **Animation**: Smooth 60fps animation with subtle bounce effect

### Background Controls
- **Video Dropdown**: Similar to radio selector, with video thumbnails as option icons
- **Fit Toggle**: Radio button group (Cover/Contain), horizontal layout, rounded-full container
- **Active State**: Accent background with 20% opacity, white text

### Theme Toggle
- **Button**: Icon-only circular button (w-10 h-10), positioned top-right of panel
- **Transition**: Smooth 300ms ease-in-out for all theme changes
- **Icons**: Sun icon for light theme, Moon icon for dark theme

### Source Switcher
- **Tab Layout**: Horizontal segmented control (YouTube/Radio)
- **Active Tab**: Accent background with full opacity
- **Inactive Tab**: Transparent with 50% opacity text

---

## Icons
- **Library**: Lucide Icons via CDN
- **Size**: Default w-5 h-5, large controls w-6 h-6
- **Icons Needed**: Play, Pause, SkipForward, SkipBack, Volume2, Sun, Moon, Video, Radio, Search, ChevronDown, X (close modal)

---

## Responsive Behavior

**Breakpoints**:
- Mobile: < 768px
- Desktop: ≥ 768px

**Mobile Adaptations**:
- Panel: Transform to bottom sheet, rounded-t-3xl, max-h-[70vh] with scroll
- Controls: Increase touch targets to min-h-12
- Visualizer: Reduce to aspect-[2/1]
- Typography: Reduce by one step (e.g., text-lg → text-base)

---

## Animations

**Minimal Animation Approach**:
- Panel transitions: 200ms ease-in-out for state changes
- Modal: Fade in (opacity + scale 95→100) over 150ms
- Dropdown: Slide down with 100ms duration
- Visualizer: Continuous 60fps canvas animation only
- Hover: 150ms opacity/background transitions
- **NO** scroll-triggered animations or excessive motion

---

## Images

This app uses **video backgrounds** as the primary visual element, not static images. The background video serves as the hero visual, filling the entire viewport with lofi aesthetic scenes (rainy window, cozy room, city night, etc.).

**Video Integration**:
- Full viewport background (object-cover or object-contain based on user selection)
- Continuous loop with no controls visible
- 5+ video options: Rainy window, Study room, City night, Forest ambience, Cozy cafe
- Smooth crossfade transition (500ms) when switching videos