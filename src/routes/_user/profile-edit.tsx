import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useBlocker,
	useNavigate,
} from "@tanstack/react-router";
import { overlay } from "overlay-kit";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { userApi } from "@/entities/user/api";
import { nicknameSchema } from "@/entities/user/model";
import { useAuth } from "@/features/auth/use-auth";
import { authStore } from "@/entities/auth/store";

export const Route = createFileRoute("/_user/profile-edit")({
	beforeLoad: ({ location }) => {
		if (authStore.get().isAuthenticated === false) {
			throw redirect({
				to: "/me",
				search: { redirect: location.href },
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { auth, login } = useAuth();
	const originalNickname = auth.user?.nickname;

	const [nickname, setNickname] = useState(originalNickname ?? "");
	const [isValid, setIsValid] = useState(true);
	const isChanged = nickname !== originalNickname;

	const navigate = useNavigate();

	function handleChangeNickname(e: React.ChangeEvent<HTMLInputElement>) {
		const changedNickname = e.target.value;
		const { success, error, data } = nicknameSchema.safeParse(changedNickname);
		console.log("nickname validation:", { success, error, data });

		setIsValid(success);
		setNickname(changedNickname);
	}

	const updateUserMut = useMutation({
		mutationFn: (nickname: string) => userApi.updateUser({ nickname }),
		onSuccess: async () => {
			await login();
			navigate({ to: "/me", replace: true, ignoreBlocker: true });
		},
	});

	function handleClickSave() {
		if (isChanged && isValid) {
			updateUserMut.mutate(nickname);
		}
	}

	useBlocker({
		shouldBlockFn: async () => {
			if ((isChanged && isValid) === false) {
				return false;
			}

			const shouldBlock = await overlay.openAsync<boolean>(
				({ isOpen, close }) => {
					return (
						<Dialog open={isOpen} onOpenChange={() => close(true)}>
							<DialogContent className="flex flex-col items-center justify-around gap-6 rounded-3xl p-4 pt-12">
								<DialogTitle className="sr-only" aria-hidden></DialogTitle>
								<div className="flex w-full flex-col items-center gap-4">
									<div className="flex flex-col items-center">
										<DialogDescription className="text-center text-title-3 font-medium text-black-2">
											변경사항이 저장되지 않았습니다. <br />
											정말 나가시겠어요?
										</DialogDescription>
									</div>
								</div>

								<div className="flex gap-4">
									<button
										onClick={() => close(false)}
										className="flex h-12 w-34 items-center justify-center rounded-lg border border-main-blue-2 bg-white py-3 text-subhead font-medium text-main-blue-2"
									>
										나가기
									</button>
									<DialogClose className="flex h-12 w-34 items-center justify-center rounded-lg border border-gray-2 bg-gray-3 py-3 text-subhead font-medium text-gray-1">
										취소
									</DialogClose>
								</div>
							</DialogContent>
						</Dialog>
					);
				},
			);

			return shouldBlock;
		},
	});

	return (
		<div className="flex min-h-dvh flex-col items-stretch overflow-x-hidden">
			<header className="z-10 grid grid-cols-3 items-center px-4 py-3 shadow-header">
				<Link to="/me" className="block size-6 justify-self-start">
					<ChevronLeftIcon />
					<span className="sr-only">뒤로 가기</span>
				</Link>

				<h1 className="justify-self-center text-body-1 font-medium text-dark-gray-1">
					닉네임 설정
				</h1>
			</header>

			<section className="flex grow flex-col justify-between px-4 pt-8 pb-6">
				<div className="align-items-start">
					<div className="flex items-end justify-between">
						<label
							htmlFor="nickname"
							className="text-subhead font-semibold text-dark-gray-1"
						>
							닉네임
						</label>
						<div className="text-body-2 font-medium text-gray-1 tabular-nums">
							<span className="text-dark-gray-1">{nickname.length}</span>
							/6
						</div>
					</div>

					<input
						type="text"
						name="nickname"
						id="nickname"
						minLength={2}
						maxLength={6}
						value={nickname}
						onChange={handleChangeNickname}
						className="mt-3 w-full rounded-sm border border-gray-2 px-4 py-3.5 text-body-1 font-medium text-dark-gray-1 focus:outline-main-blue-1"
					/>
					<p
						className={`mt-2 text-body-2 ${isValid ? "text-gray-1" : "text-red"} `}
					>
						한글, 영문, 숫자를 조합해 2~6자 이내로 공백없이 설정해주세요.
					</p>
				</div>

				<button
					disabled={
						isChanged === false || isValid === false || updateUserMut.isPending
					}
					onClick={handleClickSave}
					className="h-14 rounded-[10px] bg-main-blue-1 text-white disabled:bg-gray-bluegray-2 disabled:text-gray-1"
				>
					저장하기
				</button>
			</section>
		</div>
	);
}
