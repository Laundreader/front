import { useNavigate, useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "./use-auth";

import type { ComponentProps } from "react";

export const LogoutButton = ({
	onClick,
	className,
	...props
}: ComponentProps<"button">) => {
	const { logout } = useAuth();
	const router = useRouter();
	const navigate = useNavigate();

	function handleClickLogout(
		e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	) {
		onClick?.(e);

		logout().then(() => {
			router.invalidate().finally(() => {
				navigate({ to: "." });
			});
		});
	}

	return (
		<button
			onClick={handleClickLogout}
			className={cn(
				"h-8 rounded-sm border border-gray-2 bg-white px-2 text-body-1 text-gray-1",
				className,
			)}
			{...props}
		>
			로그아웃
		</button>
	);
};
