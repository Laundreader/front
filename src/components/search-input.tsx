import SearchIcon from "@/assets/icons/search.svg?react";

export const SearchInput = () => {
	return (
		<form className="bg-lightgray-1 flex h-[48px] w-[361px] items-center rounded-full px-[24px]">
			<input
				type="text"
				placeholder="검색어를 입력해 주세요"
				className="text-darkgray-1 flex-grow text-body-2 placeholder:text-body-2 placeholder:text-gray-1 focus:outline-none"
			/>
			<button className="ml-2 text-gray-500 hover:cursor-pointer hover:text-gray-700">
				<SearchIcon className="text-darkgray-2" />
			</button>
		</form>
	);
};
