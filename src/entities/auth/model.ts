import z from "zod";

export const oAuthProviderSchema = z.enum(["naver"]);
export type OAuthProvider = z.infer<typeof oAuthProviderSchema>;

export const authCallbackSearchSchema = z.discriminatedUnion("success", [
	z.object({
		success: z.literal(true),
		nickname: z.string(),
		firstLogin: z.boolean(),
	}),
	z.object({
		success: z.literal(false),
		code: z.number(),
		message: z.string(),
		firstLogin: z.boolean(),
	}),
]);
export type AuthCallbackSearch = z.infer<typeof authCallbackSearchSchema>;
