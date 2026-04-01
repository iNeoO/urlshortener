import type { z } from "zod";
import type {
	AuthCheckResponseSchema,
	AuthUserSchema,
	EmailValidationResponseSchema,
	PasswordResetResponseSchema,
	SignOutResponseSchema,
	SignUpResponseSchema,
} from "./auth.schema.js";

type AuthUserResponse = z.infer<typeof AuthUserSchema>;
type AuthUser = Omit<AuthUserResponse, "createdAt" | "updatedAt"> & {
	createdAt: Date;
	updatedAt: Date;
};

export type AuthUserResponseApi = { data: AuthUser };

type ApiResponse<T extends z.ZodTypeAny> = {
	data: z.infer<T>;
};

export type AuthUserCreationApi = ApiResponse<typeof SignUpResponseSchema>;
export type AuthEmailValidationApi = ApiResponse<
	typeof EmailValidationResponseSchema
>;
export type AuthPasswordResetRequestApi = ApiResponse<
	typeof PasswordResetResponseSchema
>;
export type AuthPasswordResetConfirmApi = ApiResponse<
	typeof PasswordResetResponseSchema
>;
export type AuthCheckResponseApi = ApiResponse<typeof AuthCheckResponseSchema>;
export type AuthSignOutResponseApi = ApiResponse<typeof SignOutResponseSchema>;
