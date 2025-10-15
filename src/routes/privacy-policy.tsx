import { createFileRoute, Link } from "@tanstack/react-router";
import ChevronLeftIcon from "@/assets/icons/chevron-left.svg?react";
import type { ReactNode } from "react";

export const Route = createFileRoute("/privacy-policy")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-dvh flex-col items-stretch">
			<header className="grid grid-cols-3 items-center px-4 py-3">
				<Link to="/me" className="block size-6 justify-self-start">
					<ChevronLeftIcon />
					<span className="sr-only">뒤로 가기</span>
				</Link>

				<h1 className="justify-self-center text-body-1 font-medium text-dark-gray-1">
					개인정보처리방침
				</h1>
			</header>

			<main className="flex grow flex-col justify-between px-4 pt-8 pb-15">
				<div className="space-y-4">
					<ListItem>
						<h2 className="text-title-2 font-semibold text-dark-gray-1">
							런드리더 개인정보처리방침
						</h2>
						<p>
							런드리더(이하 "서비스")는 개인정보보호법 등 관련 법령을 준수하며,
							회원의 개인정보를 안전하게 보호하기 위하여 다음과 같이
							개인정보처리방침을 수립·공개합니다.
						</p>
					</ListItem>

					<ul className="flex flex-col gap-4 text-body-1 font-medium text-dark-gray-2">
						<ListItem>
							<Subtitle>제1조(수집하는 개인정보 항목)</Subtitle>
							<Body>
								<ul>
									<li>1. 필수 항목</li>
									<li>- 이메일(네이버 로그인 계정)</li>
									<li>- 접속 기록(IP, 접속시간, 기기 정보 등)</li>
									<li>2. 서비스 이용 과정에서 수집되는 정보</li>
									<li>
										- 회원이 직접 업로드하는 세탁물(케어라벨 및 의류) 사진
									</li>
								</ul>
							</Body>
						</ListItem>
						<ListItem>
							<Subtitle>제2조(정의)</Subtitle>
							<Body>
								<ul>
									<li>
										제2조(개인정보의 수집 및 이용 목적) 수집한 개인정보는 다음의
										목적을 위해 이용됩니다.
									</li>
									<li>1. 회원 식별 및 회원제 서비스 제공</li>
									<li>2. 세탁 솔루션 및 맞춤형 서비스 제공</li>
									<li>3. 서비스 품질 개선 및 AI 알고리즘 고도화</li>
									<li>4. 고객 문의 대응 및 분쟁 해결</li>
									<li>5. 법령상 의무 이행 및 서비스 안정성 확보</li>
								</ul>
							</Body>
						</ListItem>
						<ListItem>
							<Subtitle>제3조(개인정보의 보유 및 이용 기간)</Subtitle>
							<Body>
								<ul>
									<li>
										1. 회원 탈퇴 시 수집된 개인정보는 지체 없이 파기합니다.{" "}
									</li>
									<li>
										2. 다만, 관련 법령에 따라 일정 기간 보관해야 하는 경우는
										예외로 합니다. - 접속 로그(IP 등): 「통신비밀보호법」에 따라
										3개월 보관 - 기타 법령에 따른 보존 필요 시 해당 기간 동안
										보관 후 파기{" "}
									</li>
									<li>
										3. 또한 「개인정보보호법」 제39조의6에 따라, 최근 1년 이상
										로그인하지 않은 회원(휴면계정)의 개인정보는 다른 이용자의
										개인정보와 분리하여 별도로 저장·관리합니다. 이 경우
										분리·저장 조치 30일 전까지 이메일·앱 알림 등을 통해 사전
										통지하며, 회원은 재로그인을 통해 언제든지 휴면 상태를 해제할
										수 있습니다.
									</li>
								</ul>
							</Body>
						</ListItem>
						<ListItem>
							<Subtitle>제4조(개인정보의 제3자 제공 및 위탁)</Subtitle>
							<Body>
								<ul>
									<li>
										1. 서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지
										않습니다.
									</li>
									<li>
										2. 다만 서비스 운영을 위해 클라우드 서버 및 AI 분석 서비스를
										이용할 수 있으며, 이 경우 개인정보가 위탁 처리될 수
										있습니다.
									</li>
									<li>- 수탁자: 네이버클라우드㈜</li>
									<li>
										- 위탁업무: 사용자 정보(이메일, 닉네임 등) 및 이미지
										파일(의류 및 세탁 라벨 사진) 저장, CLOVA AI를 통한 세탁 라벨
										및 의류 이미지 분석 처리
									</li>
									<li>
										- 보유 및 이용기간: 회원 탈퇴 또는 위탁 계약 종료 시까지 ※
										네이버클라우드는 클라우드 인프라 제공자이며, 개인정보를
										자체적으로 이용하지 않습니다.
									</li>
									<li>
										※ CLOVA AI 분석 과정에서 수집된 데이터는 서비스 기능 제공을
										위한 분석 목적에 한하여 이용됩니다.
									</li>
									<li>
										※ 향후 AI 모델 개선 등 추가 활용이 필요한 경우, 관련 내용을
										사전에 고지하고 이용자의 동의를 받은 후에만 이용 또는 제공할
										예정입니다.
									</li>
									<li>
										3. 위탁 시 관련 법령에 따라 안전하게 관리될 수 있도록 필요한
										조치를 취합니다.
									</li>
								</ul>
							</Body>
						</ListItem>

						<ListItem>
							<Subtitle>제5조(개인정보의 파기 절차 및 방법)</Subtitle>
							<Body>
								<ul>
									<li>
										1. 개인정보의 보유기간이 경과하거나 처리 목적이 달성된 경우
										해당 정보를 지체 없이 파기합니다.
									</li>
									<li>
										2. 전자적 파일 형태의 정보는 복구할 수 없도록 안전하게
										삭제합니다.
									</li>
								</ul>
							</Body>
						</ListItem>

						<ListItem>
							<Subtitle>제6조(회원의 권리와 행사 방법)</Subtitle>
							<Body>
								<ul>
									<li>
										1. 회원은 언제든지 자신의 개인정보를
										조회·수정·삭제·처리정지를 요청할 수 있습니다.
									</li>
									<li>
										2. 서비스는 회원 요청을 받은 경우 지체 없이 필요한 조치를
										취합니다.
									</li>
								</ul>
							</Body>
						</ListItem>

						<ListItem>
							<Subtitle>제7조(개인정보 처리방침의 변경)</Subtitle>
							<Body>
								<ul>
									<li>
										본 개인정보처리방침은 관련 법령이나 서비스 정책에 따라
										변경될 수 있으며, 변경 시 서비스 내 공지사항을 통해
										고지합니다.
									</li>
								</ul>
							</Body>
						</ListItem>

						<ListItem>
							<Subtitle>부칙</Subtitle>
							<Body>
								<ul>
									<li>본 개인정보처리방침은 2025년 ○월 ○일부터 시행합니다.</li>
								</ul>
							</Body>
						</ListItem>
					</ul>
				</div>
			</main>
		</div>
	);
}

const ListItem = ({ children }: { children: ReactNode }) => {
	return <li className="flex flex-col gap-2">{children}</li>;
};

const Subtitle = ({ children }: { children: ReactNode }) => {
	return (
		<h3 className="text-body-1 font-semibold text-dark-gray-1">{children}</h3>
	);
};

const Body = ({ children }: { children: ReactNode }) => {
	return <p className="text-body-1 text-dark-gray-2">{children}</p>;
};
