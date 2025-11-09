import { useState } from "react";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import BubblySadImg from "@/assets/images/bubbly-sad.avif";
import BubblyImg from "@/assets/images/bubbly.avif";

import { userApi } from "@/entities/user/api";
// import { useAuth } from "@/features/auth/auth-provider";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogClose,
	DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { overlay } from "overlay-kit";
import { useAuth } from "@/features/auth/use-auth";
import { authStore } from "@/entities/auth/store";

export const Route = createFileRoute("/_user/user-delete")({
	beforeLoad: ({ location }) => {
		if (authStore.get().isAuthenticated === false) {
			throw redirect({
				to: "/auth/login",
				search: { redirect: location.href },
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { auth, clear } = useAuth();

	const [isChecked, setIsChecked] = useState(false);

	const navigate = useNavigate();

	const deleteUserMut = useMutation({
		mutationFn: userApi.deleteUser,
		onSuccess: async () => {
			overlay.unmount("user-delete-confirm-dialog");
			await overlay.openAsync(({ isOpen, close }) => {
				return (
					<Dialog open={isOpen} onOpenChange={close}>
						<DialogContent className="grid size-80 grid-rows-[1fr_auto_auto] items-center justify-items-center rounded-3xl p-4">
							<div className="aspect-square w-25">
								<img
									src={BubblyImg}
									role="presentataion"
									className="h-full w-full object-contain"
								/>
							</div>

							<div className="text-center">
								<DialogTitle className="text-title-3 font-medium text-black-2">
									런드리더를 이용해주셔서 감사합니다
								</DialogTitle>
								<DialogDescription className="text-body-1 text-dark-gray-2">
									언제든 다시 가입할 수 있으니, 꼭 다시 만나요!
								</DialogDescription>
							</div>

							<DialogClose className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-main-blue-1 py-3 text-subhead font-medium text-white">
								닫기
							</DialogClose>
						</DialogContent>
					</Dialog>
				);
			});

			clear();
			navigate({ to: "/me", replace: true });
		},
	});

	async function handleClickDelete() {
		if (isChecked === false) {
			return;
		}

		const cancelDelete = await overlay.openAsync<boolean>(
			({ isOpen, close }) => {
				return (
					<Dialog open={isOpen} onOpenChange={() => close(true)}>
						<DialogContent className="grid size-80 grid-rows-[1fr_auto_auto] items-center justify-items-center rounded-3xl p-4">
							<div className="aspect-square w-25">
								<img
									src={BubblySadImg}
									role="presentataion"
									className="h-full w-full object-contain"
								/>
							</div>

							<div className="text-center">
								<DialogTitle className="text-title-3 font-medium text-black-2">
									정말 회원을 탈퇴하시겠어요?
								</DialogTitle>
								<DialogDescription className="text-body-1 text-dark-gray-2">
									탈퇴 시, 모든 기록은 사라지고 복구할 수 없어요.
								</DialogDescription>
							</div>

							<div className="flex gap-4 pt-4">
								<DialogClose className="flex h-12 w-34 items-center justify-center rounded-lg border border-gray-2 bg-gray-3 py-3 text-subhead font-medium text-gray-1">
									취소
								</DialogClose>
								<button
									onClick={() => close(false)}
									className="flex h-12 w-34 items-center justify-center rounded-lg border border-main-blue-2 bg-white py-3 text-subhead font-medium text-main-blue-2"
								>
									탈퇴하기
								</button>
							</div>
						</DialogContent>
					</Dialog>
				);
			},
			{ overlayId: "user-delete-confirm-dialog" },
		);

		if (cancelDelete === false) {
			deleteUserMut.mutate();
		}
	}

	return (
		<div className="flex min-h-dvh flex-col items-stretch overflow-x-hidden">
			<header className="z-10 grid grid-cols-3 items-center px-4 py-3 shadow-header">
				<Link to="/me" className="block size-6 justify-self-start">
					<ChevronLeftIcon />
					<span className="sr-only">뒤로 가기</span>
				</Link>

				<h1 className="justify-self-center text-body-1 font-medium text-dark-gray-1">
					회원 탈퇴
				</h1>
			</header>

			<main className="flex grow flex-col justify-between px-4 pt-8 pb-6">
				<div className="space-y-4">
					<h2 className="text-title-2 font-semibold text-dark-gray-1">
						<span className="text-main-blue-1">{auth.user?.nickname}</span>님,
						<br />
						런드리더를 정말 떠나시나요?
						<br />
						같이 하지 못해 너무 아쉬워요.
					</h2>

					<ul className="flex flex-col gap-4 text-body-1 font-medium text-dark-gray-2">
						<li>
							회원님의 개인정보는 탈퇴 즉시 삭제되며, 다만 「개인정보보호법」 및
							「통신비밀보호법」에 따라 접속 로그 등 일부 기록은 일정 기간
							보관될 수 있습니다.
						</li>
						<li>
							탈퇴와 동시에 개별 세탁 가이드, 빨래바구니 솔루션 데이터 등 이용
							내역은 복구할 수 없습니다.
						</li>
						<li>
							탈퇴 후 동일 계정으로 재가입은 즉시 가능하나, 이전 데이터는
							복구되지 않습니다.
						</li>
					</ul>
				</div>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						name="notice"
						id="notice"
						checked={isChecked}
						onChange={() => setIsChecked(!isChecked)}
						className="size-4 accent-main-blue-1"
					/>
					<label
						htmlFor="notice"
						className="text-body-1 font-medium text-black"
					>
						탈퇴 시 유의사항을 모두 확인했어요.
					</label>
				</div>
			</main>

			<footer className="grid grid-cols-2 gap-3 py-6">
				<button
					onClick={() => navigate({ to: "/me" })}
					className="h-14 rounded-[10px] bg-gray-bluegray-2 text-gray-1"
				>
					취소
				</button>
				<button
					disabled={!isChecked}
					onClick={handleClickDelete}
					className="h-14 rounded-[10px] bg-main-blue-1 text-white disabled:bg-gray-2"
				>
					탈퇴하기
				</button>
			</footer>
		</div>
	);
}
