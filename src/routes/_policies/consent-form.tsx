import { createFileRoute } from "@tanstack/react-router";
import { POLICY } from "./-constant";
import { Policy } from "./-ui";

export const Route = createFileRoute("/_policies/consent-form")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Policy.Title title={POLICY.consentForm.title} />

			<ol className="flex flex-col gap-4">
				{POLICY.consentForm.articles.map((article, index) => (
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
