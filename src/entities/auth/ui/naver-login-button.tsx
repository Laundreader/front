import NaverLogoIcon from "@/assets/icons/naver-logo.svg?react";
import { cn } from "@/lib/utils";

import type { ComponentProps } from "react";
import { useNavigate } from "@tanstack/react-router";
import { API_URL } from "@/shared/api";

export const NaverLoginButton = ({
	onClick,
	className,
	...props
}: ComponentProps<"button">) => {
	const nav = useNavigate();

	async function handleClickLoginButton(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) {
		onClick?.(e);

		nav({
			href: `${API_URL}/oauth2/authorization/naver`,
			reloadDocument: true,
		});
	}

	return (
		<button
			onClick={handleClickLoginButton}
			className={cn(
				"flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-naver text-white",
				className,
			)}
			{...props}
		>
			<NaverLogoIcon className="size-4" />
			네이버로 시작하기
		</button>
	);
};
