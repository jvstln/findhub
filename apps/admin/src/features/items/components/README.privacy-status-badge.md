# PrivacyStatusBadge Component

## Overview

The `PrivacyStatusBadge` component displays a visual indicator when an item has privacy controls enabled (hidden location or date found). It shows an eye-slash icon with a tooltip that details which fields are hidden from public users.

## Purpose

This component helps administrators quickly identify which items have privacy controls active when viewing the items dashboard. It provides clear visual feedback about what information is hidden from public users without cluttering the interface.

## Features

- **Conditional Rendering**: Only displays when privacy controls are active
- **Interactive Tooltip**: Shows detailed information about which fields are hidden
- **Two Variants**: 
  - `default`: Shows text label with icon
  - `compact`: Shows only icon (ideal for table views)
- **Accessible**: Includes screen reader text for accessibility
- **Consistent Styling**: Uses shadcn/ui Badge and Tooltip components

## Usage

### Basic Usage

```tsx
import { PrivacyStatusBadge } from "@/features/items/components";

<PrivacyStatusBadge
  hideLocation={item.hideLocation}
  hideDateFound={item.hideDateFound}
/>
```

### Compact Variant (for tables)

```tsx
<PrivacyStatusBadge
  hideLocation={item.hideLocation}
  hideDateFound={item.hideDateFound}
  variant="compact"
/>
```

### With Custom Styling

```tsx
<PrivacyStatusBadge
  hideLocation={item.hideLocation}
  hideDateFound={item.hideDateFound}
  className="ml-2"
/>
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `hideLocation` | `boolean` | Yes | - | Whether location is hidden from public |
| `hideDateFound` | `boolean` | Yes | - | Whether date found is hidden from public |
| `className` | `string` | No | - | Additional CSS classes |
| `variant` | `"default" \| "compact"` | No | `"default"` | Display variant |

## Behavior

### No Privacy Controls Active
If both `hideLocation` and `hideDateFound` are `false`, the component returns `null` and renders nothing.

### Single Field Hidden
- **Default variant**: Shows "Location" or "Date found" text with icon
- **Compact variant**: Shows only icon
- Tooltip displays the specific hidden field

### Multiple Fields Hidden
- **Default variant**: Shows "Privacy active" text with icon
- **Compact variant**: Shows only icon
- Tooltip lists all hidden fields with icons

## Integration Points

### ItemTable Component
The badge is integrated into the table view with a dedicated "Privacy" column:

```tsx
<TableCell>
  <PrivacyStatusBadge
    hideLocation={item.hideLocation}
    hideDateFound={item.hideDateFound}
    variant="compact"
  />
</TableCell>
```

### ItemCard Component
The badge appears in the card header alongside the status badge:

```tsx
<div className="flex flex-col gap-1.5">
  <StatusBadge status={item.status} />
  <PrivacyStatusBadge
    hideLocation={item.hideLocation}
    hideDateFound={item.hideDateFound}
    variant="compact"
  />
</div>
```

## Accessibility

- Uses semantic HTML with proper ARIA attributes
- Includes screen reader text describing hidden fields
- Tooltip is keyboard accessible
- Icon has appropriate size for visibility

## Visual Design

### Colors
- Uses `secondary` badge variant for subtle appearance
- Text color: `text-muted-foreground` for non-intrusive display

### Icons
- **Main icon**: `EyeOffIcon` (eye with slash) indicates privacy
- **Tooltip icons**: 
  - `MapPinIcon` for location
  - `CalendarIcon` for date found

### Spacing
- Compact design to fit in table cells
- Appropriate gap between icon and text
- Tooltip positioned above badge to avoid overlap

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **Requirement 5.3**: Visual indicators for fields hidden from public
- **Requirement 5.4**: Admin can see which fields are hidden
- **Requirement 5.5**: Eye icon with slash indicates restricted information

## Related Components

- `PrivacyControls`: Component for setting privacy controls in item form
- `ObscuredFieldIndicator`: Public-facing component shown when fields are hidden
- `StatusBadge`: Similar badge component for item status
- `ItemTable`: Table view that displays privacy badges
- `ItemCard`: Card view that displays privacy badges

## Future Enhancements

- Add click handler to quickly toggle privacy settings
- Support for additional privacy controls (e.g., hidden description)
- Batch operations to apply privacy settings to multiple items
- Analytics tracking for privacy control usage
