import SearchIcon from "@/assets/icons/search.svg?react";

export const SearchInput = () => {
	return (
		<form className="flex h-[48px] w-[361px] items-center rounded-full bg-lightgray-1 px-[24px]">
			<input
				type="text"
				placeholder="검색어를 입력해 주세요"
				className="flex-grow text-body-2 text-darkgray-1 placeholder:text-body-2 placeholder:text-gray-1 focus:outline-none"
			/>
			<button className="ml-2 text-gray-500 hover:cursor-pointer hover:text-gray-700">
				<SearchIcon className="text-darkgray-2" />
			</button>
		</form>
	);
};
