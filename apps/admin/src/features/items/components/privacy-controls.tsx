"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@findhub/ui/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldLabel,
} from "@findhub/ui/components/ui/field";
import { Switch } from "@findhub/ui/components/ui/switch";
import { CalendarIcon, EyeIcon, EyeOffIcon, MapPinIcon } from "lucide-react";

interface PrivacyControlsProps {
	hideLocation: boolean;
	hideDateFound: boolean;
	onHideLocationChange: (hide: boolean) => void;
	onHideDateFoundChange: (hide: boolean) => void;
	disabled?: boolean;
}

export function PrivacyControls({
	hideLocation,
	hideDateFound,
	onHideLocationChange,
	onHideDateFoundChange,
	disabled = false,
}: PrivacyControlsProps) {
	return (
		<div className="space-y-4">
			<div>
				<h3 className="font-semibold text-base">Privacy Controls</h3>
				<p className="text-muted-foreground text-sm">
					Control what information is visible to public users
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-base">
						<EyeOffIcon className="size-4" />
						Field Visibility
					</CardTitle>
					<CardDescription>
						Hide sensitive information from public view. Admins will always see
						complete details.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Hide Location Toggle */}
					<Field>
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1 space-y-1">
								<FieldLabel
									htmlFor="hide-location"
									className="flex items-center gap-2 text-base"
								>
									<MapPinIcon className="size-4 text-muted-foreground" />
									Hide Location from Public
								</FieldLabel>
								<FieldDescription>
									When enabled, the location where the item was found will be
									hidden from public users. They will see a message to contact
									the admin office.
								</FieldDescription>
							</div>
							<Switch
								id="hide-location"
								checked={hideLocation}
								onCheckedChange={onHideLocationChange}
								disabled={disabled}
								aria-label="Hide location from public users"
							/>
						</div>
					</Field>

					{/* Hide Date Found Toggle */}
					<Field>
						<div className="flex items-center justify-between gap-4">
							<div className="flex-1 space-y-1">
								<FieldLabel
									htmlFor="hide-date-found"
									className="flex items-center gap-2 text-base"
								>
									<CalendarIcon className="size-4 text-muted-foreground" />
									Hide Date Found from Public
								</FieldLabel>
								<FieldDescription>
									When enabled, the date when the item was found will be hidden
									from public users. They will see a message to contact the
									admin office.
								</FieldDescription>
							</div>
							<Switch
								id="hide-date-found"
								checked={hideDateFound}
								onCheckedChange={onHideDateFoundChange}
								disabled={disabled}
								aria-label="Hide date found from public users"
							/>
						</div>
					</Field>

					{/* Visual Preview */}
					{(hideLocation || hideDateFound) && (
						<div className="rounded-lg border bg-muted/50 p-4">
							<div className="mb-2 flex items-center gap-2">
								<EyeIcon className="size-4 text-muted-foreground" />
								<p className="font-medium text-sm">Public View Preview</p>
							</div>
							<div className="space-y-2 text-sm">
								{hideLocation && (
									<div className="flex items-start gap-2 rounded-md bg-background p-2">
										<MapPinIcon className="mt-0.5 size-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Location</p>
											<p className="text-muted-foreground text-xs">
												This information is hidden. Please contact the admin
												office for details.
											</p>
										</div>
									</div>
								)}
								{hideDateFound && (
									<div className="flex items-start gap-2 rounded-md bg-background p-2">
										<CalendarIcon className="mt-0.5 size-4 text-muted-foreground" />
										<div>
											<p className="font-medium">Date Found</p>
											<p className="text-muted-foreground text-xs">
												This information is hidden. Please contact the admin
												office for details.
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
