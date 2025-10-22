import { LogoutButton } from "@/features/auth/logout-button";
// import { useAuth } from "@/features/auth/auth-provider";
import { createFileRoute, Link } from "@tanstack/react-router";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import ChevronRightIcon from "@/assets/icons/chevron-right.svg?react";
import NaverLogoIcon from "@/assets/icons/naver-logo.svg?react";
import CustomerServiceIcon from "@/assets/icons/customer-service.svg?react";
import { useAuth } from "@/features/auth/use-auth";

export const Route = createFileRoute("/_user/me")({
	component: RouteComponent,
});

function RouteComponent() {
	const { auth } = useAuth();

	return (
		<div className="flex min-h-dvh flex-col items-stretch overflow-x-hidden bg-gray-3">
			<header className="z-10 grid grid-cols-3 items-center bg-white px-4 py-3 shadow-header">
				<Link to=".." className="block size-6 justify-self-start">
					<ChevronLeftIcon />
					<span className="sr-only">뒤로 가기</span>
				</Link>

				<h1 className="justify-self-center text-body-1 font-medium text-dark-gray-1">
					내 정보
				</h1>
			</header>

			<main className="flex grow flex-col gap-4 pb-12">
				<section className="bg-white px-4 pt-8 pb-12">
					{auth.isAuthenticated ? (
						<h2 className="text-title-2 font-semibold text-dark-gray-1">
							안녕하세요, {auth.user?.nickname}님
						</h2>
					) : (
						<h2 className="text-title-2 font-semibold text-dark-gray-1">
							안녕하세요,
							<br />
							추가 서비스를 이용하시려면
							<br />
							로그인을 해주세요.
						</h2>
					)}

					<div className="mt-12 flex flex-col gap-4">
						{auth.isAuthenticated ? (
							<>
								{/* 
								MARK: 닉네임
							*/}
								<Link
									to="/profile-edit"
									className="flex items-center justify-between rounded-lg border border-gray-bluegray-2 p-4"
								>
									<div className="flex flex-col gap-2">
										<span className="text-body-2 font-semibold text-gray-1">
											닉네임
										</span>
										<span className="text-subhead font-semibold text-dark-gray-1">
											{auth.user?.nickname}
										</span>
									</div>
									<ChevronRightIcon />
								</Link>

								{/* 
								MARK: 로그인 정보
							*/}
								<div className="flex items-center justify-between gap-2 rounded-lg border border-gray-bluegray-2 p-4">
									<div className="flex flex-col gap-2">
										<span className="text-body-2 font-semibold text-gray-1">
											로그인 정보
										</span>
										<span className="text-subhead font-semibold break-all text-dark-gray-1">
											{auth.user?.email}
										</span>
										<div className="flex items-center gap-1">
											<div className="flex size-4 items-center justify-center rounded-full bg-naver">
												<NaverLogoIcon className="size-1.5" />
											</div>
											<p className="text-body-2 text-gray-1">
												네이버로 가입된 계정이에요
											</p>
										</div>
									</div>

									<LogoutButton className="shrink-0" />
								</div>
							</>
						) : (
							<Link
								to="/auth/login"
								search={{ redirect: "/me" }}
								className="flex items-center justify-between rounded-lg border border-gray-bluegray-2 p-4"
							>
								<div className="flex flex-col gap-2">
									<span className="text-body-2 font-semibold text-gray-1">
										로그인 정보
									</span>
									<span className="text-subhead font-semibold text-dark-gray-1">
										로그인을 해주세요.
									</span>
								</div>
								<ChevronRightIcon />
							</Link>
						)}
					</div>
				</section>

				<section className="mt-3.5 bg-white px-4 py-8">
					{/*
					MARK: 문의하기
				*/}
					<a
						href="mailto:laundreader@gmail.com"
						className="flex items-center gap-4 rounded-lg border border-gray-bluegray-2 bg-gray-bluegray-1 p-4"
					>
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy">
							<CustomerServiceIcon className="text-gray-bluegray-1" />
						</div>
						<div className="flex grow flex-col gap-2">
							<span className="text-body-2 font-semibold text-gray-1">
								문의하기
							</span>
							<span className="text-subhead font-semibold text-dark-gray-1">
								서비스 사용 중, 불편하거나 <br /> 궁금한 사항이 있으신가요?
							</span>
						</div>
						<ChevronRightIcon className="shrink-0" />
					</a>
				</section>

				{/* 
				MARK: 탈퇴 & 정책
			*/}
				<div className="mt-9 ml-4 flex gap-4">
					{auth.isAuthenticated && (
						<Link
							to="/user-delete"
							className="w-fit text-body-1 font-medium text-gray-1 underline underline-offset-2"
						>
							회원 탈퇴하기
						</Link>
					)}
					<Link
						to="/privacy-policy"
						className="text-body-1 font-semibold text-dark-gray-2"
					>
						개인정보처리방침
					</Link>
					<Link
						to="/terms-of-service"
						className="text-body-1 font-semibold text-dark-gray-2"
					>
						이용약관
					</Link>
				</div>
			</main>
		</div>
	);
}
