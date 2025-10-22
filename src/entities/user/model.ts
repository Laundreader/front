import z from "zod";

export const nicknameSchema = z.string().regex(/^[가-힣a-zA-Z0-9]{2,6}$/);

export const userSchema = z.object({
	email: z.email(),
	provider: z.enum(["NAVER"]),
	nickname: nicknameSchema,
});
export type User = z.infer<typeof userSchema>;
