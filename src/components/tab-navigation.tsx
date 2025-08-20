import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import BascketIcon from "@/assets/icons/basket.svg?react";
import HomeIcon from "@/assets/icons/home.svg?react";
import LabelIcon from "@/assets/icons/label.svg?react";
import ChatbotIcon from "@/assets/icons/chat-bot.svg?react";
import { cn } from "@/lib/utils";

const links = [
	{ href: "/", label: "홈", icon: <HomeIcon /> },
	{ href: "/label-analysis", label: "라벨분석", icon: <LabelIcon /> },
	{ href: "/laundry-basket", label: "빨래바구니", icon: <BascketIcon /> },
	{ href: "/chat", label: "AI챗봇", icon: <ChatbotIcon /> },
];

export const TabNavigation = ({
	className,
	...props
}: ComponentProps<"nav">) => {
	return (
		<nav
			className={cn(
				"h-22 w-full max-w-[393px] rounded-t-3xl bg-white px-4 pt-2 shadow-tab-nav",
				className,
			)}
			{...props}
		>
			<ul className="flex justify-evenly">
				{links.map((link) => (
					<li key={link.label} className="flex flex-col">
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
			className="flex min-h-14 min-w-14 flex-col items-center gap-1 text-caption text-gray-1"
			activeProps={{
				className: "text-main-blue-1",
			}}
		>
			{children}
		</Link>
	);
};
