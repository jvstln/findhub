# Responsive Design Testing Guide

## Quick Test Instructions

### Using Browser DevTools

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Toggle Device Toolbar** (Ctrl+Shift+M or Cmd+Shift+M)
3. **Test each breakpoint** using the presets or custom dimensions

### Test Dimensions

#### Mobile (< 768px)
- iPhone SE: 375 x 667
- iPhone 12/13: 390 x 844
- Samsung Galaxy S20: 360 x 800
- Small mobile: 320 x 568

#### Tablet (768px - 1024px)
- iPad Mini: 768 x 1024
- iPad Air: 820 x 1180
- iPad Pro: 1024 x 1366

#### Desktop (> 1024px)
- Laptop: 1280 x 720
- Desktop: 1920 x 1080
- Large Desktop: 2560 x 1440

## Page-by-Page Testing Checklist

### Home Page (/)

**Mobile:**
- [ ] Hero section displays properly with stacked buttons
- [ ] Mission cards stack vertically
- [ ] Recent items show in single column
- [ ] All buttons are at least 44px tall
- [ ] No horizontal scrolling
- [ ] Text is readable (not too small)
- [ ] Images load and scale properly

**Tablet:**
- [ ] Hero section uses 2-column layout for buttons
- [ ] Mission cards display in 3-column grid
- [ ] Recent items show in 2-column grid
- [ ] Navigation shows partial desktop nav
- [ ] Spacing is appropriate

**Desktop:**
- [ ] Full hero layout with decorative elements
- [ ] Mission cards in 3-column grid
- [ ] Recent items in 3-column grid
- [ ] Full navigation visible
- [ ] Hover effects work

### Search Page (/search)

**Mobile:**
- [ ] Search bar is full width
- [ ] Filters are accessible (sidebar/drawer)
- [ ] Results display in single column
- [ ] Pagination buttons are touch-friendly
- [ ] Filter controls are at least 44px tall
- [ ] No horizontal scrolling

**Tablet:**
- [ ] Search bar spans available width
- [ ] Filters in sidebar (collapsible)
- [ ] Results in 2-column grid
- [ ] Pagination centered

**Desktop:**
- [ ] Search bar in header area
- [ ] Filters in persistent sidebar
- [ ] Results in 3-column grid
- [ ] All controls easily accessible

### Item Detail Page (/items/[id])

**Mobile:**
- [ ] Image displays full width
- [ ] Details stack vertically
- [ ] Back button is touch-friendly
- [ ] Claim instructions visible
- [ ] No horizontal scrolling

**Tablet:**
- [ ] Image sized appropriately
- [ ] Details in 2-column grid
- [ ] Good use of space

**Desktop:**
- [ ] Large image display
- [ ] Details in 2-column grid
- [ ] Sidebar information visible
- [ ] Contact CTA prominent

### About Page (/about)

**Mobile:**
- [ ] Hero section stacks properly
- [ ] Contact cards stack vertically
- [ ] Office hours readable
- [ ] Claim process steps clear
- [ ] No horizontal scrolling

**Tablet:**
- [ ] Contact/location in 2-column grid
- [ ] Claim steps display well
- [ ] Good spacing

**Desktop:**
- [ ] Full layout with proper spacing
- [ ] 2-column contact grid
- [ ] All information easily scannable

### Dashboard (/dashboard)

**Mobile:**
- [ ] Sidebar collapses to hamburger
- [ ] Stats cards stack vertically
- [ ] Table switches to card view
- [ ] Filters are accessible
- [ ] All buttons touch-friendly
- [ ] No horizontal scrolling

**Tablet:**
- [ ] Sidebar toggleable
- [ ] Stats in 2-column grid
- [ ] Table responsive or card view
- [ ] Filters accessible

**Desktop:**
- [ ] Persistent sidebar
- [ ] Stats in 4-column grid
- [ ] Full table view
- [ ] All actions visible
- [ ] Hover states work

### Item Form (/dashboard/items/new, /dashboard/items/[id]/edit)

**Mobile:**
- [ ] All inputs full width
- [ ] Labels clearly visible
- [ ] Image upload works
- [ ] Preview displays properly
- [ ] Submit button touch-friendly
- [ ] Validation errors visible
- [ ] No horizontal scrolling

**Tablet:**
- [ ] Form layout optimized
- [ ] Image preview sized well
- [ ] Good spacing

**Desktop:**
- [ ] Multi-column layout where appropriate
- [ ] Image preview prominent
- [ ] All controls easily accessible

## Touch Target Verification

### Critical Interactive Elements

Check that these elements meet the 44x44px minimum on mobile:

- [ ] Navigation menu button (hamburger)
- [ ] All primary buttons (Search, Sign In, etc.)
- [ ] Form submit buttons
- [ ] Pagination buttons
- [ ] Filter controls (selects, inputs)
- [ ] Action buttons (Edit, Delete, Status change)
- [ ] Close buttons on modals
- [ ] Dropdown triggers
- [ ] Card click areas

### How to Verify Touch Targets

1. Open DevTools
2. Right-click element → Inspect
3. Check computed height in Styles panel
4. Verify: height + padding ≥ 44px on mobile

## Common Issues to Check

### Horizontal Scrolling
- [ ] No horizontal scrollbar on any page
- [ ] Content fits within viewport width
- [ ] Images don't overflow
- [ ] Tables use overflow-x-auto when needed
- [ ] Long text wraps or truncates

### Text Readability
- [ ] Font sizes appropriate for device
- [ ] Line heights comfortable
- [ ] Contrast sufficient
- [ ] No text cutoff

### Images
- [ ] Images load properly
- [ ] Aspect ratios maintained
- [ ] No distortion or stretching
- [ ] Responsive sizing works
- [ ] Loading states visible

### Forms
- [ ] Inputs are usable on mobile
- [ ] Labels clearly associated
- [ ] Error messages visible
- [ ] Validation works
- [ ] Submit buttons accessible

### Navigation
- [ ] Mobile menu works
- [ ] All links accessible
- [ ] Active states visible
- [ ] Breadcrumbs if applicable

## Browser Testing

Test on multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (iOS/macOS)
- [ ] Samsung Internet (Android)

## Real Device Testing

If possible, test on actual devices:
- [ ] iPhone (any model)
- [ ] Android phone (any model)
- [ ] iPad or Android tablet
- [ ] Desktop/laptop

## Performance Checks

### Mobile Performance
- [ ] Page loads quickly
- [ ] Images optimized
- [ ] No layout shift
- [ ] Smooth scrolling
- [ ] Animations perform well

### Network Conditions
- [ ] Test on slow 3G
- [ ] Test offline (PWA)
- [ ] Check loading states

## Accessibility Checks

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Alt text on images

## Final Verification

Run through complete user flows:

### Public User Flow
1. [ ] Visit home page
2. [ ] Navigate to search
3. [ ] Apply filters
4. [ ] View item details
5. [ ] Read about page
6. [ ] Check contact info

### Admin User Flow
1. [ ] Log in
2. [ ] View dashboard
3. [ ] Create new item
4. [ ] Edit existing item
5. [ ] Change item status
6. [ ] Delete item

## Automated Testing

Run these commands:

```bash
# Type checking
bun run check-types

# Linting and formatting
bun run check

# Build test
bun run build
```

## Lighthouse Audit

1. Open DevTools
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Run audit
5. Check scores:
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 90

## Sign-off

- [ ] All mobile tests passed
- [ ] All tablet tests passed
- [ ] All desktop tests passed
- [ ] Touch targets verified
- [ ] No horizontal scrolling
- [ ] Performance acceptable
- [ ] Accessibility verified

**Tested by:** _________________
**Date:** _________________
**Notes:** _________________
