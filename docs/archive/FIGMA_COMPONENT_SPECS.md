# Figma Component Specifications

## 🎨 Component Library Structure

### 1. Buttons

#### Primary Button
- **Variant:** Primary
- **States:** Default, Hover, Active, Disabled, Loading
- **Sizes:** Small (32px), Medium (40px), Large (48px)
- **Specs:**
  - Background: `#ff6b35`
  - Hover: `#ff5722`
  - Text: White, 16px, Medium weight
  - Padding: `12px 24px` (medium)
  - Border radius: `8px`
  - Shadow: None (flat design)
  - Icon spacing: `8px` from text

#### Secondary Button
- Background: `#f3f4f6` (Gray 100)
- Hover: `#e5e7eb` (Gray 200)
- Text: `#111827` (Gray 900)
- Same padding and radius as primary

#### Ghost Button
- Background: Transparent
- Hover: `#f9fafb` (Gray 50)
- Text: `#6b7280` (Gray 500)

#### Outline Button
- Background: Transparent
- Border: `1px solid #e5e7eb` (Gray 200)
- Hover: `#f9fafb` (Gray 50)
- Text: `#111827` (Gray 900)

**Loading State:**
- Spinner icon replaces text
- Spinner: `16px`, `#ffffff` (white) or `#111827` (dark)
- Animation: Rotate 360deg, 1s linear, infinite

---

### 2. Inputs

#### Text Input
- **Height:** `40px`
- **Padding:** `12px 16px`
- **Border:** `1px solid #e5e7eb` (Gray 200)
- **Border radius:** `8px`
- **Background:** White
- **Font:** 16px, Regular, `#111827` (Gray 900)
- **Placeholder:** `#9ca3af` (Gray 400), 16px

**Focus State:**
- Border: `2px solid #ff6b35`
- Box shadow: `0 0 0 3px rgba(255, 107, 53, 0.1)`
- Outline: None

**Error State:**
- Border: `2px solid #ef4444` (Red 500)
- Error message below: 14px, Red 500, `8px` margin top

**Disabled State:**
- Background: `#f9fafb` (Gray 50)
- Border: `1px solid #e5e7eb` (Gray 200)
- Text: `#9ca3af` (Gray 400)
- Cursor: not-allowed

#### Textarea
- Same as input
- Min height: `100px`
- Resizable: Vertical only
- Padding: `12px 16px`

#### Select Dropdown
- Same styling as input
- Dropdown icon: `#6b7280` (Gray 500), `16px`, right side, `16px` from edge
- Options list:
  - Background: White
  - Border: `1px solid #e5e7eb` (Gray 200)
  - Border radius: `8px`
  - Shadow: `shadow-lg`
  - Max height: `300px`, scrollable
  - Option padding: `12px 16px`
  - Option hover: `#f9fafb` (Gray 50)
  - Selected option: `#eff6ff` (Blue 50) background

---

### 3. Cards

#### Provider Card (Compact)
- **Dimensions:** Flexible width, auto height
- **Background:** White
- **Border:** `1px solid #e5e7eb` (Gray 200)
- **Border radius:** `12px`
- **Padding:** `16px`
- **Shadow:** `shadow-sm`
- **Spacing:**
  - Image: Full width, `aspect-ratio: 4/3`
  - Title: `16px` margin top
  - Categories: `12px` margin top
  - Rating: `12px` margin top
  - Location: `8px` margin top

**Hover State:**
- Shadow: `shadow-md`
- Border: `1px solid #ff6b35`
- Transform: None (no scale)

#### Provider Card (Expanded)
- Same as compact
- Padding: `24px`
- More generous spacing between elements

#### Content Card
- Background: White
- Border radius: `12px`
- Padding: `24px`
- Shadow: `shadow-sm`
- No border

---

### 4. Badges & Status Chips

#### Status Badge
- **Verified:**
  - Background: `#22c55e` (Green 500)
  - Text: White, 12px, Medium
  - Padding: `4px 8px`
  - Border radius: `4px`
  - Icon: Checkmark, `12px`, white

- **Pending:**
  - Background: `#f59e0b` (Yellow 500)
  - Same styling as verified

- **Rejected:**
  - Background: `#ef4444` (Red 500)
  - Same styling as verified

- **Suspended:**
  - Background: `#6b7280` (Gray 500)
  - Same styling as verified

#### Category Badge
- Background: `#ffe5d9` (Orange 100)
- Text: `#ff6b35` (Orange 500), 12px, Medium
- Padding: `4px 8px`
- Border radius: `4px`

---

### 5. Modals

#### Modal Overlay
- Background: `rgba(0, 0, 0, 0.5)` (50% black)
- Backdrop blur: `4px` (optional)
- Full screen coverage
- Z-index: `1040`

#### Modal Content
- **Max width:** `500px` (desktop), `100%` (mobile)
- **Background:** White
- **Border radius:** `16px`
- **Padding:** `24px`
- **Shadow:** `shadow-xl`
- **Z-index:** `1050`
- **Position:** Centered (vertical and horizontal)

#### Modal Header
- Title: H3 style
- Close button: Top right, `24px` icon, Gray 500
- Padding bottom: `16px`
- Border bottom: `1px solid #e5e7eb` (Gray 200)
- Margin bottom: `24px`

#### Modal Body
- Padding: `0` (handled by modal padding)
- Max height: `70vh`, scrollable

#### Modal Footer
- Padding top: `16px`
- Border top: `1px solid #e5e7eb` (Gray 200)
- Button spacing: `12px`
- Button alignment: Right (desktop), Full width stacked (mobile)

---

### 6. Tables

#### Table Container
- Border: `1px solid #e5e7eb` (Gray 200)
- Border radius: `8px`
- Overflow: Hidden
- Background: White

#### Table Header
- Background: `#f9fafb` (Gray 50)
- Text: `#6b7280` (Gray 500), 14px, Medium
- Padding: `12px 16px`
- Border bottom: `1px solid #e5e7eb` (Gray 200)
- Text align: Left (default), Right (for numbers)

#### Table Row
- Border bottom: `1px solid #e5e7eb` (Gray 200)
- Padding: `12px 16px`
- Background: White
- Hover: `#f9fafb` (Gray 50)

#### Table Cell
- Padding: `12px 16px`
- Text: 14px, Regular
- Vertical align: Middle

**Last row:** No border bottom

---

### 7. Notifications & Toasts

#### Toast (Success)
- **Position:** Top right (desktop), Top center (mobile)
- **Width:** `320px` (desktop), `90%` (mobile)
- **Background:** White
- **Border left:** `4px solid #22c55e` (Green 500)
- **Shadow:** `shadow-lg`
- **Padding:** `16px`
- **Border radius:** `8px`
- **Icon:** Checkmark, `20px`, Green 500, left side
- **Text:** 14px, Regular, `#111827` (Gray 900)
- **Spacing:** `12px` between icon and text
- **Auto-dismiss:** 5 seconds, fade out animation

#### Toast (Error)
- Same as success
- Border left: `4px solid #ef4444` (Red 500)
- Icon: X, Red 500

#### Notification Tray
- **Position:** Below notification icon
- **Width:** `360px` (desktop), `100%` (mobile)
- **Background:** White
- **Border:** `1px solid #e5e7eb` (Gray 200)
- **Border radius:** `12px`
- **Shadow:** `shadow-lg`
- **Max height:** `400px`
- **Overflow:** Scroll
- **Padding:** `8px 0`

#### Notification Item
- **Padding:** `12px 16px`
- **Border bottom:** `1px solid #f3f4f6` (Gray 100)
- **Unread:** Background `#eff6ff` (Blue 50)
- **Hover:** `#f9fafb` (Gray 50)
- **Icon:** Left side, `20px`, `12px` margin right
- **Content:** Title (14px, Semibold) + Body (12px, Regular)
- **Time:** Right side, 12px, Gray 400

**Last item:** No border bottom

---

### 8. Avatar

#### Sizes
- **Small:** `32px` diameter
- **Medium:** `40px` diameter (default)
- **Large:** `64px` diameter
- **XLarge:** `96px` diameter

#### Fallback
- Background: `#e5e7eb` (Gray 200)
- Text: `#6b7280` (Gray 500), Medium weight
- Initials: Centered, uppercase
- Font size: 50% of avatar size

#### Image
- Border radius: `50%` (full circle)
- Object fit: Cover
- Border: `2px solid white` (optional, for status indicators)

---

### 9. File Upload

#### Upload Area
- **Border:** `2px dashed #d1d5db` (Gray 300)
- **Border radius:** `8px`
- **Background:** `#f9fafb` (Gray 50)
- **Padding:** `32px`
- **Text align:** Center
- **Min height:** `120px`
- **Icon:** Upload icon, `32px`, Gray 400, centered
- **Text:** "Drag and drop files here" or "Click to upload", 14px, Gray 500
- **Subtext:** "Max file size: 5MB", 12px, Gray 400, `8px` margin top

**Hover State:**
- Border: `2px dashed #ff6b35`
- Background: `#fff5f2` (Orange 50)

**Active/Drag State:**
- Border: `2px solid #ff6b35`
- Background: `#ffe5d9` (Orange 100)

#### File Preview
- **Container:** Flex row, `12px` gap
- **Thumbnail:** `64px x 64px`, border radius `8px`
- **Info:** File name (14px, Semibold) + Size (12px, Gray 500)
- **Remove button:** Top right of thumbnail, `16px` icon, Red 500
- **Progress bar:** Below thumbnail (for uploads in progress)

---

### 10. Forms

#### Form Group
- **Margin bottom:** `24px`
- **Label:** 14px, Semibold, `#111827` (Gray 900), `8px` margin bottom
- **Required indicator:** Red asterisk, `*`, after label
- **Help text:** 12px, Gray 500, `4px` margin top
- **Error text:** 12px, Red 500, `4px` margin top

#### Form Layout
- **Single column:** Mobile
- **Two columns:** Desktop (for related fields)
- **Field spacing:** `24px` vertical

---

### 11. Progress Indicators

#### Progress Bar
- **Height:** `4px`
- **Background:** `#e5e7eb` (Gray 200)
- **Border radius:** `2px`
- **Fill:** `#ff6b35` (Orange 500)
- **Animation:** Smooth transition

#### Step Indicator (Onboarding)
- **Container:** Flex row, centered
- **Step:** Circle `32px`, border `2px solid #e5e7eb` (Gray 200)
- **Active step:** Border `#ff6b35`, background `#fff5f2` (Orange 50)
- **Completed step:** Background `#ff6b35`, checkmark icon white
- **Connector:** Line `2px solid #e5e7eb` (Gray 200), `24px` between steps
- **Label:** Below circle, 12px, Gray 500 (active: Orange 500)

---

### 12. Charts

#### Chart Container
- **Background:** White
- **Border:** `1px solid #e5e7eb` (Gray 200)
- **Border radius:** `12px`
- **Padding:** `24px`
- **Title:** H4 style, `16px` margin bottom

#### Chart Colors
- Primary: `#ff6b35` (Orange 500)
- Secondary: `#3b82f6` (Blue 500)
- Success: `#22c55e` (Green 500)
- Warning: `#f59e0b` (Yellow 500)
- Error: `#ef4444` (Red 500)

---

## 📱 Responsive Behavior

### Mobile (360px)
- Single column layouts
- Full-width components
- Stacked buttons
- Bottom navigation
- Touch targets: Min `44px x 44px`

### Tablet (768px)
- 2-column grids
- Side-by-side buttons
- Collapsible sidebar
- Card grids: 2 columns

### Desktop (1024px+)
- 3-4 column grids
- Full navigation bar
- Sidebar always visible
- Card grids: 3-4 columns

---

## 🎯 Component States

### Interactive States
- **Default:** Base styling
- **Hover:** Subtle background change, shadow increase
- **Active/Pressed:** Slight scale down (0.98), darker background
- **Focus:** Orange ring (`2px solid #ff6b35`, `2px` offset)
- **Disabled:** 50% opacity, no interaction, grayed out
- **Loading:** Spinner replaces content, disabled state

### Validation States
- **Default:** Gray border
- **Valid:** Green border (`#22c55e`)
- **Error:** Red border (`#ef4444`) + error message
- **Warning:** Yellow border (`#f59e0b`) + warning message

---

## 📐 Spacing System

Use 4px base unit:
- `4px` - Tight spacing (icons, badges)
- `8px` - Small spacing (form fields)
- `12px` - Medium spacing (card padding)
- `16px` - Base spacing (sections)
- `24px` - Large spacing (between sections)
- `32px` - XLarge spacing (major sections)
- `48px` - XXLarge spacing (page sections)

---

## 🔤 Typography Hierarchy

### Headings
- **H1:** 36px / Bold / Display font / Line-height: 1.2
- **H2:** 30px / Bold / Display font / Line-height: 1.2
- **H3:** 24px / Semibold / Sans font / Line-height: 1.3
- **H4:** 20px / Semibold / Sans font / Line-height: 1.4

### Body
- **Large:** 18px / Regular / Line-height: 1.6
- **Base:** 16px / Regular / Line-height: 1.6 (minimum)
- **Small:** 14px / Regular / Line-height: 1.5
- **Caption:** 12px / Regular / Line-height: 1.4

---

## 🎨 Color Usage Guidelines

### Primary Orange (`#ff6b35`)
- Use for: Primary CTAs, active states, links, brand elements
- Don't use for: Error states, success states, large backgrounds

### Semantic Colors
- **Success (Green):** Verified badges, success messages, positive actions
- **Error (Red):** Error messages, destructive actions, warnings
- **Warning (Yellow):** Pending states, caution messages
- **Info (Blue):** Informational messages, neutral actions

### Neutral Grays
- **Gray 900:** Primary text (headings, body)
- **Gray 500:** Secondary text (captions, labels)
- **Gray 400:** Tertiary text (placeholders, hints)
- **Gray 200:** Borders, dividers
- **Gray 50:** Backgrounds, hover states

---

## ♿ Accessibility Requirements

### Contrast
- Text on white: Minimum 4.5:1 (WCAG AA)
- Large text (18px+): Minimum 3:1
- Interactive elements: Minimum 3:1

### Focus States
- Visible on all interactive elements
- Orange ring: `2px solid #ff6b35`, `2px` offset
- Keyboard navigation: Tab order logical

### Touch Targets
- Minimum: `44px x 44px` (mobile)
- Spacing between targets: `8px` minimum

---

**All components should follow these specifications for consistency and accessibility.**

