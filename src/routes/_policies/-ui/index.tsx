import { Link } from "@tanstack/react-router";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";

const Header = ({ title }: { title: string }) => {
	return (
		<header className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 shadow-header">
			<Link to="/me" className="block size-6 justify-self-start">
				<ChevronLeftIcon />
				<span className="sr-only">뒤로 가기</span>
			</Link>

			<h1 className="justify-self-center text-body-1 font-medium text-dark-gray-1">
				{title}
			</h1>
		</header>
	);
};

const Introduction = ({ introduction }: { introduction: string }) => {
	return <p className="text-body-1 text-dark-gray-2">{introduction}</p>;
};

const Title = ({ title }: { title: string }) => {
	return (
		<h2 className="text-title-2 font-semibold text-dark-gray-1">{title}</h2>
	);
};

const Article = ({ children }: { children: React.ReactNode }) => {
	return <div className="flex flex-col gap-2">{children}</div>;
};

const Subtitle = ({ children }: { children: React.ReactNode }) => {
	return (
		<h3 className="text-body-1 font-semibold text-dark-gray-1">{children}</h3>
	);
};

const Content = ({ children }: { children: React.ReactNode }) => {
	return <div className="text-body-1 text-dark-gray-2">{children}</div>;
};

export const Policy = {
	Header,
	Title,
	Introduction,
	Article,
	Subtitle,
	Content,
};
