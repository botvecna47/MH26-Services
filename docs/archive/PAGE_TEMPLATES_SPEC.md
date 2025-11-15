# Page Templates Specification

## 📄 Page Layouts for Figma

### 1. Home Page

#### Hero Section
- **Height:** `400px` (desktop), `300px` (mobile)
- **Background:** Gradient `from-orange-50 to-white`
- **Layout:** 2-column (desktop), 1-column (mobile)
- **Left:** 
  - H1: "Find Trusted Local Service Providers in Nanded"
  - Body: Description text, 18px
  - Search bar: Full width, `40px` height
  - Stats: 3-column grid, `16px` gap
- **Right:**
  - Image: `aspect-ratio: 16/10`, rounded `24px`, shadow `lg`

#### Categories Section
- **Background:** White
- **Padding:** `64px` vertical (desktop), `48px` (mobile)
- **Title:** H2, centered, `32px` margin bottom
- **Grid:** 4 columns (desktop), 2 columns (mobile), `16px` gap
- **Card:** `120px` height, border, hover effect

#### Featured Providers
- **Background:** `#f9fafb` (Gray 50)
- **Padding:** `64px` vertical
- **Grid:** 4 columns (desktop), 1 column (mobile)
- **Card:** Provider card component

#### How It Works
- **Background:** White
- **Padding:** `64px` vertical
- **Grid:** 3 columns (desktop), 1 column (mobile)
- **Icon:** `64px` circle, Orange 100 background
- **Content:** Centered, `24px` spacing

---

### 2. Service Listing Page

#### Search & Filter Bar (Sticky)
- **Position:** Sticky top, below navigation
- **Background:** White
- **Border bottom:** `1px solid #e5e7eb` (Gray 200)
- **Padding:** `16px` vertical
- **Layout:** Flex row (desktop), Stacked (mobile)
- **Components:**
  - Search input: Flex-1
  - Category select: `200px` width
  - Sort select: `160px` width
  - Apply button: `120px` width (mobile only)

#### Results Section
- **Padding:** `32px` vertical
- **Header:** 
  - Title: H1
  - Count: Body small, Gray 500
  - `24px` margin bottom
- **Grid:** 3 columns (desktop), 1 column (mobile), `24px` gap
- **Empty state:** Centered, `64px` padding, icon + message

---

### 3. Provider Detail Page

#### Header Section
- **Image:** Full width, `400px` height (desktop), `250px` (mobile)
- **Overlay:** Gradient bottom (black, 50% opacity)
- **Info card:** Absolute bottom, white background, `24px` padding, `16px` radius
- **Content:**
  - Title: H2, `16px` margin bottom
  - Categories: Badges, `12px` margin bottom
  - Rating: Star + number, `12px` margin bottom
  - Location: Icon + text
  - Verified badge: Top right of image

#### Tabs Section
- **Tabs:** Underline style, `24px` padding
- **Active:** Orange underline, Orange 500 text
- **Inactive:** Gray 500 text
- **Content:** Tab panels, `32px` padding top

#### Booking CTA (Mobile)
- **Position:** Fixed bottom
- **Background:** White
- **Border top:** `1px solid #e5e7eb` (Gray 200)
- **Padding:** `16px`
- **Button:** Full width, Primary

---

### 4. Booking Flow (Multi-Step)

#### Progress Indicator
- **Position:** Top, below navigation
- **Background:** White
- **Border bottom:** `1px solid #e5e7eb` (Gray 200)
- **Padding:** `16px` vertical
- **Steps:** 4-5 steps, connected circles

#### Form Steps
- **Padding:** `32px` vertical
- **Max width:** `600px`, centered
- **Card:** White background, `24px` padding, `16px` radius
- **Fields:** `24px` spacing between
- **Buttons:** 
  - Back: Left, Ghost
  - Next/Submit: Right, Primary
  - `12px` gap

#### Review Step
- **Summary card:** 
  - Border: `1px solid #e5e7eb` (Gray 200)
  - Border radius: `12px`
  - Padding: `24px`
  - Background: `#f9fafb` (Gray 50)
- **Items:** 
  - Label: 14px, Semibold, Gray 700
  - Value: 14px, Regular, Gray 900
  - `16px` spacing between items

#### Confirmation
- **Icon:** Checkmark circle, `64px`, Green 500
- **Title:** H2, centered
- **Message:** Body, centered, Gray 600
- **Actions:** Button group, centered

---

### 5. Unified Dashboard

#### Layout
- **Sidebar:** `240px` width (desktop), hidden (mobile)
- **Main:** Flex-1
- **Tabs:** Top, `24px` padding, border bottom

#### Overview Tab
- **Stats cards:** 4-column grid (desktop), 2-column (mobile)
- **Card:**
  - Background: White
  - Border: `1px solid #e5e7eb` (Gray 200)
  - Border radius: `12px`
  - Padding: `24px`
  - Icon: Top left, `32px`, colored background circle
  - Value: H3, `16px` margin top
  - Label: Body small, Gray 500

#### Bookings Tab
- **Filters:** Top bar, `16px` padding
- **Table:** Full width, responsive
- **Actions:** Inline buttons, `8px` spacing

#### Transactions Tab
- **Same as Bookings**
- **Status badges:** Inline
- **Amount:** Right aligned, Semibold

---

### 6. Provider Dashboard

#### Layout
- **Same as Unified Dashboard**
- **Additional sections:**
  - Earnings chart
  - Calendar widget
  - Services list

#### Earnings Section
- **Chart:** Line or bar chart
- **Period selector:** Tabs (7d, 30d, 90d, 1y)
- **Summary:** Total, this month, last month

#### Calendar Widget
- **Size:** `300px` width
- **Bookings:** Highlighted dates
- **Legend:** Color-coded statuses

#### Services List
- **Card:** Service name, price, duration
- **Actions:** Edit, Delete buttons
- **Add button:** Primary, top right

---

### 7. Admin Panel

#### Layout
- **Sidebar:** `260px` width, collapsible
- **Main:** Flex-1
- **Top bar:** Quick actions, `16px` padding

#### Sidebar
- **Sections:**
  - Dashboard
  - Providers (Pending, All, Suspended)
  - Users
  - Reports
  - Settings
- **Active:** Orange background, white text
- **Icon:** Left, `20px`
- **Text:** 14px, Medium

#### Pending Providers
- **List:** Table or cards
- **Actions:** Approve, Reject buttons
- **Filters:** Status, date, category

#### Document Viewer Modal
- **Image viewer:** Full width, `500px` max height
- **PDF viewer:** Embedded or download button
- **Actions:** Approve, Reject, Request more info
- **Reason field:** Textarea (for rejection)

---

### 8. Auth Pages

#### Sign In / Sign Up
- **Layout:** Centered, max width `400px`
- **Card:** White, `24px` padding, `16px` radius, shadow `lg`
- **Logo:** Top center, `48px` margin bottom
- **Title:** H2, centered, `24px` margin bottom
- **Form:** `24px` spacing between fields
- **Submit button:** Full width, Primary, `16px` margin top
- **Links:** Centered, `16px` margin top
- **Divider:** "OR" text, `24px` margin vertical
- **Social buttons:** Full width, Outline style

#### Join Now (Provider)
- **Same as Sign Up**
- **Additional:** Role selector (Customer/Provider)
- **Provider flow:** Multi-step onboarding

---

### 9. Provider Onboarding

#### Progress Bar
- **Steps:** 5 steps
- **Current step:** Highlighted
- **Completed steps:** Green checkmark

#### Step 1: Basic Info
- **Fields:**
  - Business name (required)
  - Owner name (required)
  - Email (required, validated)
  - Phone (required, validated)
  - Description (textarea)

#### Step 2: Services
- **Add service button:** Primary, `16px` margin bottom
- **Service cards:**
  - Title, Description, Price, Duration
  - Edit, Delete actions
- **Form:** Modal or inline

#### Step 3: Location
- **Map:** Embedded Google Maps, `400px` height
- **Address input:** Autocomplete
- **Fields:** Address, City, State, Pincode
- **Coordinates:** Auto-filled from map

#### Step 4: Documents
- **Upload areas:** 
  - Aadhar (required)
  - PAN (required)
  - GST (optional)
  - License (required)
  - Shop photo (required)
- **Preview:** Thumbnail, remove button
- **Validation:** File type, size

#### Step 5: Preview
- **Summary:** All entered data
- **Edit links:** Next to each section
- **Submit button:** Primary, full width

#### Submitted State
- **Message:** "Application submitted successfully"
- **Status:** Pending badge
- **Info:** "We'll review your application within 24-48 hours"
- **Actions:** View application, Contact support

---

### 10. Report Provider Form

#### Modal
- **Title:** "Report Provider"
- **Reason dropdown:** Required, full width
- **Details textarea:** Required, `120px` min height
- **File upload:** Optional, max 3 files
- **Submit button:** Primary, full width
- **Cancel button:** Ghost, full width (mobile)

#### Confirmation
- **Icon:** Checkmark, Green 500
- **Message:** "Report submitted successfully"
- **Info:** "Our team will review within 24 hours"
- **Close button:** Primary

---

### 11. Messages UI

#### Layout
- **Sidebar:** `320px` width (desktop), hidden (mobile)
- **Main:** Conversation thread
- **Mobile:** Full screen conversation

#### Inbox List
- **Item:**
  - Avatar: Left, `40px`
  - Name: 14px, Semibold, `8px` margin bottom
  - Preview: 12px, Regular, Gray 500, 1 line truncate
  - Time: Right, 12px, Gray 400
  - Unread: Blue dot, `8px`, top right
- **Active:** Orange background
- **Hover:** Gray 50 background

#### Conversation Thread
- **Header:** 
  - Avatar + Name
  - Status: Online/Offline indicator
  - Actions: Call, Video, More
- **Messages:**
  - Sent: Right aligned, Orange background
  - Received: Left aligned, White background
  - Timestamp: 12px, Gray 400, `8px` margin top
  - Read receipt: Checkmark, `12px`, bottom right
- **Input:**
  - Textarea: `80px` height, border radius `24px`
  - Attach button: Left
  - Send button: Right, Primary, `32px` circle
- **Typing indicator:** "..." animation, left side

---

### 12. Notification Center

#### Tray
- **Position:** Dropdown from bell icon
- **Width:** `360px` (desktop), `100%` (mobile)
- **Max height:** `400px`, scrollable
- **Header:** "Notifications", "Mark all read" link
- **Items:** Notification item component
- **Footer:** "View all" link, centered

#### Notification Item
- **Icon:** Left, `20px`, colored circle background
- **Content:**
  - Title: 14px, Semibold
  - Body: 12px, Regular, Gray 600
  - Time: 12px, Gray 400
- **Unread:** Blue 50 background
- **Hover:** Gray 50 background
- **Click:** Navigate to related page

---

### 13. Invoice Template

#### Layout
- **Max width:** `800px`, centered
- **Background:** White
- **Padding:** `48px` (desktop), `24px` (mobile)

#### Header
- **Logo:** Left, `120px` width
- **Invoice details:** Right aligned
  - Invoice #: H4
  - Date: Body
  - Status: Badge
- **Border bottom:** `2px solid #e5e7eb` (Gray 200)
- **Padding bottom:** `24px`
- **Margin bottom:** `32px`

#### Parties
- **Two columns:** Provider (left), Customer (right)
- **Title:** H4, `16px` margin bottom
- **Info:** Body, `8px` spacing between lines

#### Line Items Table
- **Header:** Gray 50 background, Semibold
- **Rows:** 
  - Service name
  - Quantity
  - Unit price
  - Total (right aligned)
- **Border:** `1px solid #e5e7eb` (Gray 200)

#### Totals
- **Right aligned:**
  - Subtotal
  - Tax (GST)
  - Platform fee
  - **Total:** H3, Orange 500, `16px` margin top

#### Footer
- **Payment info:** Left
- **Download PDF button:** Right, Primary
- **Border top:** `1px solid #e5e7eb` (Gray 200)
- **Padding top:** `24px`
- **Margin top:** `32px`

---

## 📱 Mobile Adaptations

### Navigation
- **Desktop:** Horizontal bar
- **Mobile:** Hamburger menu + bottom navigation

### Cards
- **Desktop:** Multi-column grid
- **Mobile:** Single column, full width

### Tables
- **Desktop:** Full table
- **Mobile:** Card layout or horizontal scroll

### Modals
- **Desktop:** Centered, max width
- **Mobile:** Full screen, swipe to close

### Forms
- **Desktop:** 2-column layout (related fields)
- **Mobile:** Single column, stacked

---

## 🎯 Interaction Patterns

### Phone Reveal (Gated Content)
**Not Logged In:**
- Display: Blurred phone number (`filter: blur(4px)`)
- Overlay: Gradient from transparent to white
- CTA: "Continue to get full contact access" button
- Modal: Login/Sign up flow (no redirect)
- Toast: "Sign in to view contact details"

**Logged In:**
- Display: Full phone number
- Format: `tel:` link, clickable
- Icon: Phone icon, `16px`, Orange 500
- No blur, no CTA

### Progressive Disclosure
- Show summary first
- "Show more" link expands content
- Smooth transition (200ms)
- No hard redirects

### Loading States
- Skeleton loaders for content
- Spinner for actions
- Progress bar for uploads
- Shimmer effect for cards

---

## 📊 Sample Data (5 entries each)

### Providers
1. Shri Sai Tiffin Service (Tiffin)
2. QuickFix Plumbing (Plumbing)
3. Bright Electric Solutions (Electrical)
4. Sparkle Clean Services (Cleaning)
5. Elite Salon & Spa (Salon)

### Users
1. Devansh Patel (Customer)
2. Priya Sharma (Customer)
3. Rajesh Kumar (Provider)
4. Admin User (Admin)
5. Test Provider (Provider)

### Services
1. Home Tiffin Delivery (₹150/day)
2. Pipe Repair Service (₹500)
3. Electrical Installation (₹2000)
4. Deep Cleaning (₹1500)
5. Haircut & Styling (₹300)

### Transactions
1. Booking #BK001 - ₹500 - Completed
2. Booking #BK002 - ₹1500 - Pending
3. Booking #BK003 - ₹2000 - Confirmed
4. Booking #BK004 - ₹300 - Completed
5. Booking #BK005 - ₹150 - Cancelled

---

**All pages should follow these specifications for consistency and user experience.**

