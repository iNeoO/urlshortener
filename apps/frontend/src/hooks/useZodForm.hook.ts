import { useState } from "react";
import type { z } from "zod";

type FieldErrors<TField extends string> = Partial<Record<TField, string>>;

export function useZodForm<TField extends string>(fields: readonly TField[]) {
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<TField>>({});

	const clearFieldErrors = () => {
		setFieldErrors({});
	};

	const safeParseWithFieldErrors = <TSchema extends z.ZodTypeAny>(
		schema: TSchema,
		input: unknown,
	) => {
		clearFieldErrors();
		const parsed = schema.safeParse(input);

		if (!parsed.success) {
			const nextFieldErrors: FieldErrors<TField> = {};
			for (const issue of parsed.error.issues) {
				const field = issue.path[0];
				if (
					typeof field === "string" &&
					fields.includes(field as TField) &&
					!nextFieldErrors[field as TField]
				) {
					nextFieldErrors[field as TField] = issue.message;
				}
			}
			setFieldErrors(nextFieldErrors);
		}

		return parsed;
	};

	return {
		fieldErrors,
		clearFieldErrors,
		safeParseWithFieldErrors,
	};
}
