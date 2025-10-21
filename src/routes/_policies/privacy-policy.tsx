import { createFileRoute } from "@tanstack/react-router";
import { POLICY } from "./-constants";
import { Policy } from "./-ui";

export const Route = createFileRoute("/_policies/privacy-policy")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Policy.Article>
				<Policy.Title title={POLICY.privacyPolicy.title} />
				<Policy.Introduction introduction={POLICY.privacyPolicy.introduction} />
			</Policy.Article>

			<ol className="flex flex-col gap-4">
				{POLICY.privacyPolicy.articles.map((article, index) => (
					<li key={index}>
						<Policy.Article>
							<Policy.Subtitle>{article.title}</Policy.Subtitle>
							<Policy.Content>
								<ul>
									{article.content.map((line, lineIndex) => (
										<li key={lineIndex}>{line}</li>
									))}
								</ul>
							</Policy.Content>
						</Policy.Article>
					</li>
				))}
			</ol>
		</>
	);
}
