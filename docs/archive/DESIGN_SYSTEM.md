# MH26 Services Design System

## 🎨 Design Philosophy

**Tone:** Minimal, human, slightly corporate — trustworthy and enterprise-ready  
**Approach:** Mobile-first, accessible, consistent  
**Typography:** Inter (primary), Poppins (display)  
**Icons:** Lucide/Feather icon set  
**Transitions:** 150-200ms, subtle easing

---

## 📐 Design Tokens

### Colors

**Primary Brand (Orange)**
- Primary: `#ff6b35` (Orange 500)
- Primary Hover: `#ff5722` (Orange 600)
- Primary Light: `#ffe5d9` (Orange 100)
- Use for: CTAs, links, active states, brand elements

**Semantic Colors**
- Success: `#22c55e` (Green 500) - Verified badges, success states
- Error: `#ef4444` (Red 500) - Errors, destructive actions
- Warning: `#f59e0b` (Yellow 500) - Warnings, pending states
- Info: `#3b82f6` (Blue 500) - Information, neutral actions

**Neutral Grays**
- Background: `#f9fafb` (Gray 50)
- Surface: `#ffffff` (White)
- Border: `#e5e7eb` (Gray 200)
- Text Primary: `#111827` (Gray 900)
- Text Secondary: `#6b7280` (Gray 500)
- Text Tertiary: `#9ca3af` (Gray 400)

### Typography Scale

**Headings**
- H1: `2.25rem` (36px) / Bold / Line-height: 1.2
- H2: `1.875rem` (30px) / Bold / Line-height: 1.2
- H3: `1.5rem` (24px) / Semibold / Line-height: 1.3
- H4: `1.25rem` (20px) / Semibold / Line-height: 1.4

**Body Text**
- Body Large: `1.125rem` (18px) / Regular / Line-height: 1.6
- Body: `1rem` (16px) / Regular / Line-height: 1.6 (minimum)
- Body Small: `0.875rem` (14px) / Regular / Line-height: 1.5
- Caption: `0.75rem` (12px) / Regular / Line-height: 1.4

**Font Weights**
- Regular: 400 (body text)
- Medium: 500 (emphasis)
- Semibold: 600 (headings, labels)
- Bold: 700 (display text)

### Spacing Scale

4px base unit system:
- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px (base unit)
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px
- `space-16`: 64px

### Border Radius

- `radius-sm`: 4px (badges, small elements)
- `radius-md`: 8px (buttons, inputs, cards)
- `radius-lg`: 12px (modals, large cards)
- `radius-full`: 9999px (pills, avatars)

### Shadows

- `shadow-sm`: Subtle elevation (cards at rest)
- `shadow-md`: Medium elevation (hovered cards, dropdowns)
- `shadow-lg`: High elevation (modals, popovers)

### Transitions

- Fast: `150ms` (hover states, micro-interactions)
- Normal: `200ms` (default transitions)
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth, natural)

---

## 🧩 Component Library

### Buttons

**Primary Button**
- Background: `#ff6b35`
- Hover: `#ff5722`
- Text: White
- Padding: `12px 24px`
- Border radius: `8px`
- Font: 16px, Medium
- States: Default, Hover, Active, Disabled, Loading

**Secondary Button**
- Background: `#f3f4f6` (Gray 100)
- Hover: `#e5e7eb` (Gray 200)
- Text: `#111827` (Gray 900)
- Border: None

**Ghost Button**
- Background: Transparent
- Hover: `#f9fafb` (Gray 50)
- Text: `#6b7280` (Gray 500)
- Border: None

**Outline Button**
- Background: Transparent
- Border: `1px solid #e5e7eb` (Gray 200)
- Hover: `#f9fafb` (Gray 50)
- Text: `#111827` (Gray 900)

**Sizes**
- Small: `8px 16px` / 14px text
- Medium: `12px 24px` / 16px text (default)
- Large: `16px 32px` / 18px text

### Inputs

**Text Input**
- Height: `40px`
- Padding: `12px 16px`
- Border: `1px solid #e5e7eb` (Gray 200)
- Border radius: `8px`
- Focus: `2px solid #ff6b35` with `0 0 0 3px rgba(255, 107, 53, 0.1)`
- Placeholder: `#9ca3af` (Gray 400)
- Error state: Red border + error message below

**Textarea**
- Min height: `100px`
- Same styling as input
- Resizable: Vertical only

**Select**
- Same as input
- Dropdown arrow: `#6b7280` (Gray 500)
- Options: Hover state `#f9fafb` (Gray 50)

### Cards

**Provider Card (Compact)**
- Background: White
- Border: `1px solid #e5e7eb` (Gray 200)
- Border radius: `12px`
- Padding: `16px`
- Shadow: `shadow-sm`
- Hover: `shadow-md` + border `#ff6b35`

**Provider Card (Expanded)**
- Same as compact
- Padding: `24px`
- More spacing between elements

**Content Card**
- Background: White
- Border radius: `12px`
- Padding: `24px`
- Shadow: `shadow-sm`

### Badges & Status Chips

**Status Badges**
- Verified: Green (`#22c55e`) background, white text
- Pending: Yellow (`#f59e0b`) background, white text
- Rejected: Red (`#ef4444`) background, white text
- Size: `6px 12px`, 12px font, `4px` radius

**Category Badge**
- Background: `#ffe5d9` (Orange 100)
- Text: `#ff6b35` (Orange 500)
- Size: `4px 8px`, 12px font

### Modals

**Modal Overlay**
- Background: `rgba(0, 0, 0, 0.5)` (50% black)
- Backdrop blur: `4px`

**Modal Content**
- Background: White
- Border radius: `16px`
- Max width: `500px` (mobile: full width)
- Padding: `24px`
- Shadow: `shadow-xl`

**Modal Header**
- Padding bottom: `16px`
- Border bottom: `1px solid #e5e7eb` (Gray 200)
- Title: H3 style

**Modal Footer**
- Padding top: `16px`
- Border top: `1px solid #e5e7eb` (Gray 200)
- Button spacing: `12px`

### Tables

**Table**
- Border: `1px solid #e5e7eb` (Gray 200)
- Border radius: `8px`
- Overflow: Hidden

**Table Header**
- Background: `#f9fafb` (Gray 50)
- Text: `#6b7280` (Gray 500), 14px, Medium
- Padding: `12px 16px`

**Table Row**
- Border bottom: `1px solid #e5e7eb` (Gray 200)
- Padding: `12px 16px`
- Hover: `#f9fafb` (Gray 50)

### Notifications & Toasts

**Toast (Success)**
- Background: White
- Border left: `4px solid #22c55e` (Green 500)
- Shadow: `shadow-lg`
- Padding: `16px`
- Icon: Green checkmark
- Auto-dismiss: 5 seconds

**Toast (Error)**
- Same as success
- Border left: `4px solid #ef4444` (Red 500)
- Icon: Red X

**Notification Tray**
- Background: White
- Border: `1px solid #e5e7eb` (Gray 200)
- Border radius: `12px`
- Shadow: `shadow-lg`
- Max height: `400px`
- Overflow: Scroll

**Notification Item**
- Padding: `12px 16px`
- Border bottom: `1px solid #f3f4f6` (Gray 100)
- Unread: Background `#eff6ff` (Blue 50)
- Hover: `#f9fafb` (Gray 50)

### Avatar

**Sizes**
- Small: `32px`
- Medium: `40px` (default)
- Large: `64px`
- XLarge: `96px`

**Fallback**
- Background: `#e5e7eb` (Gray 200)
- Text: `#6b7280` (Gray 500)
- Initials: Medium weight, centered

### File Upload

**Upload Area**
- Border: `2px dashed #d1d5db` (Gray 300)
- Border radius: `8px`
- Background: `#f9fafb` (Gray 50)
- Padding: `32px`
- Text: Center aligned, `#6b7280` (Gray 500)

**Upload Hover**
- Border: `2px dashed #ff6b35`
- Background: `#fff5f2` (Orange 50)

**File Preview**
- Thumbnail: `64px x 64px`
- Border radius: `8px`
- Remove button: Top right, red X icon

---

## 📱 Responsive Breakpoints

### Mobile (360px - 767px)
- Single column layouts
- Stacked navigation
- Full-width cards
- Bottom navigation bar
- Touch-friendly targets (min 44px)

### Tablet (768px - 1023px)
- 2-column grids
- Side navigation (collapsible)
- Card grids: 2 columns

### Desktop (1024px - 1439px)
- 3-column grids
- Full navigation bar
- Card grids: 3 columns
- Sidebar layouts

### Wide (1440px+)
- 4-column grids
- Max content width: `1280px`
- Card grids: 4 columns

---

## ♿ Accessibility Standards

### Contrast Ratios (WCAG AA)
- Normal text: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- Interactive elements: Minimum 3:1

### Focus States
- Outline: `2px solid #ff6b35`
- Offset: `2px`
- Visible on all interactive elements

### Keyboard Navigation
- Tab order: Logical flow
- Skip links: Available
- Escape: Closes modals
- Enter/Space: Activates buttons

---

## 🎯 Component Variants

### Button Variants
- `primary` - Orange background, white text
- `secondary` - Gray background, dark text
- `outline` - Transparent, bordered
- `ghost` - Transparent, no border
- `destructive` - Red background, white text
- `disabled` - 50% opacity, no interaction
- `loading` - Spinner icon, disabled state

### Card Variants
- `compact` - Less padding, tighter spacing
- `expanded` - More padding, generous spacing
- `interactive` - Hover effects, clickable
- `static` - No hover, informational only

### Status Variants
- `verified` - Green badge
- `pending` - Yellow badge
- `rejected` - Red badge
- `suspended` - Gray badge

---

## 📄 Page Layouts

### Home Page
- Hero section: Full width, gradient background
- Search bar: Prominent, centered
- Categories: 4-column grid (mobile: 2-column)
- Featured providers: 4-column grid (mobile: 1-column)
- Stats section: 3-column grid

### Service Listing
- Filters: Sticky top bar
- Results: 3-column grid (mobile: 1-column)
- Pagination: Bottom center
- Empty state: Centered, clear CTA

### Provider Detail
- Header: Image + basic info
- Tabs: Services, Reviews, About
- Booking CTA: Sticky bottom (mobile)
- Contact: Phone reveal pattern

### Booking Flow
- Multi-step form
- Progress indicator: Top
- Step validation: Inline
- Review step: Summary card
- Confirmation: Success state

### Dashboard (Unified)
- Tabs: Overview, Bookings, Transactions, Profile
- Stats cards: 4-column grid (mobile: 2-column)
- Table: Responsive, horizontal scroll on mobile
- Filters: Collapsible section

### Admin Panel
- Layout: Left sidebar + main content
- Sidebar: Collapsible, icon + text
- Quick actions: Top bar
- Tables: Full width, sortable
- Modals: Document viewer, approval actions

---

## 🔐 Gated Content Pattern

### Phone Reveal
**Not Logged In:**
- Display: Blurred phone number
- Overlay: Subtle gradient
- CTA: "Continue to get full contact access"
- Modal: Login/Sign up flow
- No hard redirects

**Logged In:**
- Display: Full phone number
- Format: `tel:` link (click to call)
- Icon: Phone icon
- No blur, no CTA

---

## 📝 Developer Annotations

### Token Naming
- Colors: `color.brand.primary.500`
- Spacing: `space.4` (16px)
- Typography: `typography.heading.h1`
- Shadows: `shadow.md`

### API Field Mapping
- Provider name: `provider.businessName`
- Rating: `provider.averageRating`
- Status: `provider.status` (PENDING/APPROVED/REJECTED)
- Location: `provider.city` + `provider.state`
- Phone: `provider.user.phone` (gated)

### Component Props
Document all component props with:
- Type
- Required/Optional
- Default value
- Description
- Example usage

---

**This design system ensures consistency, accessibility, and a professional appearance across the entire MH26 Services platform.**

