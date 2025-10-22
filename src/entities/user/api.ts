import { http } from "@/shared/api";

import type { HttpResponseSuccess } from "@/shared/api";
import type { User } from "./model";

// MARK: 내 정보 조회
async function getUser(): Promise<User> {
	const response = await http
		.get<HttpResponseSuccess<User>>("user/me")
		.json()
		.catch((err) => {
			throw new Error("get User 실패: " + err);
		});

	return response.data;
}

// MARK: 회원 정보 수정
async function updateUser(user: Pick<User, "nickname">) {
	const response = await http
		.patch<
			HttpResponseSuccess<Pick<User, "nickname">>
		>("user/nickname", { json: { nickname: user.nickname } })
		.json();

	return response.data;
}

// MARK: 회원 탈퇴
async function deleteUser() {
	await http.delete("user");
}

export const userApi = {
	getUser,
	updateUser,
	deleteUser,
};
