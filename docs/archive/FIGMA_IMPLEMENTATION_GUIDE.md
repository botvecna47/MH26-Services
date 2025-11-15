# Figma Implementation Guide

## 🎯 Overview

This guide provides everything needed to implement the MH26 Services design system in Figma, including component library, page templates, and interaction patterns.

---

## 📦 Deliverables Checklist

### ✅ Component Library (Tokens JSON)
- [x] **Colors:** Brand, semantic, neutral
- [x] **Typography:** Font families, sizes, weights, line heights
- [x] **Spacing:** 4px base unit system
- [x] **Border Radius:** Scale from sm to full
- [x] **Shadows:** Elevation system
- [x] **Transitions:** Timing and easing
- [x] **Breakpoints:** Mobile, tablet, desktop, wide
- [x] **Z-Index:** Layering system

**File:** `frontend/src/styles/design-tokens.json`

### ✅ Component Specifications
- [x] Buttons (Primary, Secondary, Ghost, Outline)
- [x] Inputs (Text, Textarea, Select)
- [x] Cards (Compact, Expanded)
- [x] Badges & Status Chips
- [x] Modals
- [x] Tables
- [x] Notifications & Toasts
- [x] Avatar
- [x] File Upload
- [x] Forms
- [x] Progress Indicators
- [x] Charts

**File:** `FIGMA_COMPONENT_SPECS.md`

### ✅ Responsive Page Templates
- [x] Home
- [x] Service Listing
- [x] Provider Detail
- [x] Booking Flow
- [x] Unified Dashboard
- [x] Provider Dashboard
- [x] Admin Panel
- [x] Auth (Sign In / Sign Up / Join Now)
- [x] Provider Onboarding (Multi-step)
- [x] Report Provider Form
- [x] Messages UI
- [x] Notification Center
- [x] Invoices

**File:** `PAGE_TEMPLATES_SPEC.md`

### ✅ Special Patterns
- [x] Phone Reveal (Gated Content)
- [x] Progressive Disclosure
- [x] Admin Approval UX
- [x] Document Viewer Modal

---

## 🎨 Setting Up in Figma

### Step 1: Create Design Tokens

1. **Import Color Styles:**
   - Create color styles from `design-tokens.json`
   - Name: `Brand/Primary/500`, `Semantic/Success/500`, etc.
   - Use exact hex values from tokens

2. **Create Text Styles:**
   - H1, H2, H3, H4 (from typography scale)
   - Body, Body Small, Caption
   - Use Inter for body, Poppins for headings

3. **Create Effect Styles:**
   - Shadow sm, md, lg, xl
   - Use exact values from tokens

4. **Create Spacing System:**
   - Create auto-layout frames with spacing tokens
   - Use 4px, 8px, 12px, 16px, 24px, 32px, etc.

### Step 2: Build Component Library

#### Button Component
- **Variants:**
  - Type: Primary, Secondary, Ghost, Outline
  - Size: Small, Medium, Large
  - State: Default, Hover, Active, Disabled, Loading
- **Properties:**
  - Icon (optional)
  - Text (optional)
  - Loading state (boolean)

#### Input Component
- **Variants:**
  - Type: Text, Textarea, Select
  - State: Default, Focus, Error, Disabled
- **Properties:**
  - Label (optional)
  - Placeholder
  - Error message (optional)
  - Help text (optional)

#### Card Component
- **Variants:**
  - Type: Compact, Expanded
  - Interactive: Yes, No
- **Properties:**
  - Content (slot)

#### Badge Component
- **Variants:**
  - Type: Verified, Pending, Rejected, Suspended, Category
- **Properties:**
  - Text
  - Icon (optional)

### Step 3: Create Page Templates

Use the specifications in `PAGE_TEMPLATES_SPEC.md` to create:
1. Frame for each page (use breakpoint widths)
2. Apply auto-layout for responsive behavior
3. Use component library for consistency
4. Add annotations for developers

### Step 4: Add Interactions

#### Phone Reveal Pattern
1. Create blurred phone number state
2. Add overlay with CTA button
3. Create modal for login/signup
4. Add click interaction: Open modal
5. Create logged-in state (full phone, tel: link)

#### Modal Interactions
1. Overlay click: Close modal
2. Escape key: Close modal
3. Close button: Close modal
4. Smooth transitions: 200ms

#### Form Validation
1. Error state: Red border + message
2. Success state: Green border
3. Disabled state: Grayed out

---

## 📐 Component Variants Structure

### Button
```
Button
├── Type: Primary | Secondary | Ghost | Outline
├── Size: Small | Medium | Large
└── State: Default | Hover | Active | Disabled | Loading
```

### Input
```
Input
├── Type: Text | Textarea | Select
└── State: Default | Focus | Error | Disabled
```

### Badge
```
Badge
└── Type: Verified | Pending | Rejected | Suspended | Category
```

### Card
```
Card
├── Type: Compact | Expanded
└── Interactive: Yes | No
```

---

## 🎯 Page Frame Setup

### Frame Sizes
- **Mobile:** 360px width
- **Tablet:** 768px width
- **Desktop:** 1024px width
- **Wide:** 1440px width

### Auto-Layout Settings
- **Direction:** Vertical (pages), Horizontal (sections)
- **Padding:** Use spacing tokens
- **Gap:** Use spacing tokens
- **Alignment:** Left (default), Center (hero sections)

---

## 📝 Developer Annotations

### Token References
- Use format: `{token.category.subcategory.value}`
- Example: `{color.brand.primary.500}`

### API Field Mapping
- Annotate components with expected API fields
- Example: "Provider name: `provider.businessName`"

### Component Props
- Document all props in component description
- Include: Type, Required, Default, Description

### Spacing Annotations
- Mark spacing between elements
- Use token names: `space-4`, `space-6`, etc.

---

## 🎨 Visual Guidelines

### Brand Identity
- **Primary Color:** Orange (`#ff6b35`)
- **Tone:** Minimal, human, slightly corporate
- **Avoid:** Flashy gradients, excessive animations
- **Icons:** Lucide/Feather style (minimal, outlined)

### Typography
- **Headings:** Poppins (display font)
- **Body:** Inter (readable, professional)
- **Minimum size:** 16px for body text
- **Line height:** 1.4-1.6 for readability

### Spacing
- **Base unit:** 4px
- **Consistent spacing:** Use tokens, not arbitrary values
- **Visual rhythm:** 8px, 16px, 24px, 32px

### Accessibility
- **Contrast:** WCAG AA minimum (4.5:1)
- **Focus states:** Visible orange ring
- **Touch targets:** Minimum 44px x 44px
- **Keyboard navigation:** Logical tab order

---

## 🔄 Interaction Flows

### Booking Flow
1. Service selection → Provider detail
2. Date/time picker → Review
3. Payment → Confirmation
4. Progress indicator shows current step

### Provider Onboarding
1. Basic info → Services → Location → Documents → Preview
2. Progress bar at top
3. Draft autosave indicator
4. Validation on each step
5. Final submission → Pending state

### Admin Approval
1. Pending providers list
2. Click provider → Document viewer modal
3. Approve/Reject actions
4. Reason field (for rejection)
5. Confirmation toast

### Phone Reveal
1. Blurred phone number (not logged in)
2. Click CTA → Login modal
3. After login → Full phone number
4. Click phone → tel: link (call)

---

## 📱 Responsive Behavior

### Mobile (360px)
- Single column
- Stacked components
- Full-width buttons
- Bottom navigation
- Swipeable modals

### Tablet (768px)
- 2-column grids
- Side-by-side buttons
- Collapsible sidebar
- Card grids: 2 columns

### Desktop (1024px+)
- 3-4 column grids
- Full navigation
- Always-visible sidebar
- Card grids: 3-4 columns

---

## ✅ Pre-populated Preview Data

### 5 Sample Providers
1. **Shri Sai Tiffin Service**
   - Category: Tiffin Service
   - Rating: 4.8 (127 reviews)
   - Location: Vazirabad, Nanded
   - Status: Verified

2. **QuickFix Plumbing**
   - Category: Plumbing
   - Rating: 4.6 (89 reviews)
   - Location: Nanded
   - Status: Verified

3. **Bright Electric Solutions**
   - Category: Electrical
   - Rating: 4.9 (156 reviews)
   - Location: Nanded
   - Status: Verified

4. **Sparkle Clean Services**
   - Category: Cleaning
   - Rating: 4.7 (98 reviews)
   - Location: Nanded
   - Status: Pending

5. **Elite Salon & Spa**
   - Category: Salon
   - Rating: 4.5 (67 reviews)
   - Location: Nanded
   - Status: Verified

### 5 Sample Users
1. Devansh Patel (Customer)
2. Priya Sharma (Customer)
3. Rajesh Kumar (Provider)
4. Admin User (Admin)
5. Test Provider (Provider)

### 5 Sample Services
1. Home Tiffin Delivery - ₹150/day
2. Pipe Repair Service - ₹500
3. Electrical Installation - ₹2000
4. Deep Cleaning - ₹1500
5. Haircut & Styling - ₹300

### 5 Sample Transactions
1. Booking #BK001 - ₹500 - Completed
2. Booking #BK002 - ₹1500 - Pending
3. Booking #BK003 - ₹2000 - Confirmed
4. Booking #BK004 - ₹300 - Completed
5. Booking #BK005 - ₹150 - Cancelled

---

## 🎯 Key UX Patterns

### Progressive Disclosure
- Show summary, "Show more" expands
- No hard redirects
- Smooth transitions

### Gated Content
- Blurred content + CTA
- Modal for login (no redirect)
- Toast explanation

### Loading States
- Skeleton loaders
- Spinner for actions
- Progress bars for uploads

### Error Handling
- Inline error messages
- Clear error states
- Helpful guidance

---

## 📋 Implementation Checklist

### Design System
- [ ] Import color tokens
- [ ] Create text styles
- [ ] Create effect styles (shadows)
- [ ] Set up spacing system
- [ ] Create component library

### Components
- [ ] Buttons (all variants)
- [ ] Inputs (all types)
- [ ] Cards
- [ ] Badges
- [ ] Modals
- [ ] Tables
- [ ] Notifications
- [ ] Avatar
- [ ] File Upload
- [ ] Forms
- [ ] Progress Indicators

### Pages
- [ ] Home
- [ ] Service Listing
- [ ] Provider Detail
- [ ] Booking Flow
- [ ] Dashboard
- [ ] Provider Dashboard
- [ ] Admin Panel
- [ ] Auth Pages
- [ ] Provider Onboarding
- [ ] Report Form
- [ ] Messages
- [ ] Notifications
- [ ] Invoices

### Interactions
- [ ] Phone reveal pattern
- [ ] Modal interactions
- [ ] Form validation
- [ ] Loading states
- [ ] Error states

### Responsive
- [ ] Mobile layouts (360px)
- [ ] Tablet layouts (768px)
- [ ] Desktop layouts (1024px+)
- [ ] Breakpoint testing

### Annotations
- [ ] Token references
- [ ] API field mappings
- [ ] Component props
- [ ] Spacing annotations

---

## 🚀 Next Steps

1. **Import tokens** into Figma
2. **Build component library** following specs
3. **Create page templates** with sample data
4. **Add interactions** for key flows
5. **Test responsive** behavior
6. **Add annotations** for developers
7. **Export assets** (icons, images)
8. **Create prototype** with clickable flows

---

**All specifications are ready for Figma implementation!**

