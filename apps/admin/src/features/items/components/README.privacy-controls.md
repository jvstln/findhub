# Privacy Controls Component

## Overview

The `PrivacyControls` component provides a user interface for administrators to control the visibility of sensitive item information (location and date found) to public users. This component is part of the item security and privacy feature.

## Features

- **Toggle Switches**: Easy-to-use switches for hiding location and date found
- **Clear Labels**: Descriptive labels and descriptions for each privacy option
- **Visual Preview**: Real-time preview showing how hidden fields appear to public users
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Disabled State**: Can be disabled during form submission or loading states

## Usage

```tsx
import { PrivacyControls } from "@/features/items/components";

function ItemForm() {
	const [hideLocation, setHideLocation] = useState(false);
	const [hideDateFound, setHideDateFound] = useState(false);

	return (
		<PrivacyControls
			hideLocation={hideLocation}
			hideDateFound={hideDateFound}
			onHideLocationChange={setHideLocation}
			onHideDateFoundChange={setHideDateFound}
		/>
	);
}
```

## Props

### `hideLocation: boolean`
Current state of the location visibility toggle. When `true`, location is hidden from public users.

### `hideDateFound: boolean`
Current state of the date found visibility toggle. When `true`, date found is hidden from public users.

### `onHideLocationChange: (hide: boolean) => void`
Callback function called when the location visibility toggle is changed.

### `onHideDateFoundChange: (hide: boolean) => void`
Callback function called when the date found visibility toggle is changed.

### `disabled?: boolean` (optional)
When `true`, disables all toggle switches. Useful during form submission or loading states.
Default: `false`

## Integration with React Hook Form

The component is designed to work seamlessly with React Hook Form:

```tsx
import { useForm, Controller } from "react-hook-form";
import { PrivacyControls } from "@/features/items/components";

function ItemForm() {
	const { control, watch } = useForm({
		defaultValues: {
			hideLocation: false,
			hideDateFound: false,
		},
	});

	const hideLocation = watch("hideLocation");
	const hideDateFound = watch("hideDateFound");

	return (
		<Controller
			name="hideLocation"
			control={control}
			render={({ field: locationField }) => (
				<Controller
					name="hideDateFound"
					control={control}
					render={({ field: dateField }) => (
						<PrivacyControls
							hideLocation={locationField.value}
							hideDateFound={dateField.value}
							onHideLocationChange={locationField.onChange}
							onHideDateFoundChange={dateField.onChange}
						/>
					)}
				/>
			)}
		/>
	);
}
```

## Visual Preview

The component includes a visual preview section that automatically appears when one or more fields are hidden. This preview shows:

- An icon indicating the field type (location or date)
- The field name
- The message that public users will see

This helps administrators understand exactly what public users will experience.

## Accessibility

- All toggle switches have proper ARIA labels
- Keyboard navigation is fully supported
- Screen readers will announce the state changes
- Visual indicators use sufficient color contrast

## Styling

The component uses:
- shadcn/ui Card components for consistent styling
- Lucide React icons for visual indicators
- Tailwind CSS for responsive layout
- Muted colors for secondary information

## Requirements Satisfied

This component satisfies the following requirements from the specification:

- **3.1**: Display toggle controls in the Item Registration Form
- **3.2**: Store privacy control settings as boolean fields
- **3.3**: Enable "Hide location from public" toggle
- **3.4**: Enable "Hide date found from public" toggle
- **3.5**: Allow independent toggling of privacy controls
- **3.6**: Preserve privacy control settings when editing
- **3.7**: Display current privacy control states in edit form

## Related Components

- `SecurityQuestionsBuilder`: For adding verification questions
- `ItemForm`: Parent form component that integrates privacy controls
- `ObscuredFieldIndicator`: Public-facing component that shows hidden field messages
