import { Link } from "@tanstack/react-router";
import PersonIcon from "@/assets/icons/person.svg?react";

export const ProfileButton = () => {
	return (
		<Link
			to="/me"
			className="flex size-8 items-center justify-center rounded-full bg-white/60"
		>
			<PersonIcon className="text-deep-blue" />
			<span className="sr-only">프로필 페이지</span>
		</Link>
	);
};
