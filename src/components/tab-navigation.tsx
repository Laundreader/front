import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import BascketIcon from "@/assets/icons/basket.svg?react";
import HomeIcon from "@/assets/icons/home.svg?react";
import LabelIcon from "@/assets/icons/label.svg?react";
import { cn } from "@/lib/utils";

const links = [
	{ href: "/", label: "홈", icon: <HomeIcon /> },
	{ href: "/label-analysis", label: "라벨분석", icon: <LabelIcon /> },
	{ href: "/laundry-basket", label: "빨래바구니", icon: <BascketIcon /> },
];

export const TabNavigation = ({
	className,
	...props
}: ComponentProps<"nav">) => {
	return (
		<nav
			className={cn(
				"h-[90px] w-full rounded-t-[24px] bg-white px-[50px] pt-[8px] shadow-tab-nav",
				className,
			)}
			{...props}
		>
			<ul className="mx-auto flex justify-between">
				{links.map((link) => (
					<li className="flex flex-col">
						<LinkButton key={link.href} href={link.href}>
							{link.icon}
							<span>{link.label}</span>
						</LinkButton>
					</li>
				))}
			</ul>
		</nav>
	);
};

type LinkButtonProps = {
	children: ReactNode;
	href: string;
};

const LinkButton = ({ children, href }: LinkButtonProps) => {
	return (
		<Link
			to={href}
			className="flex min-h-[52px] min-w-[52px] flex-col items-center gap-[4px] text-caption text-gray-1"
			activeProps={{
				className: "text-main-blue-1",
			}}
		>
			{children}
		</Link>
	);
};
