import { HttpResponse } from "msw";
import type { DefaultBodyType, HttpResponseResolver, PathParams } from "msw";

export function withAuth<
	Params extends PathParams,
	RequestBodyType extends DefaultBodyType,
>(
	resolver: HttpResponseResolver,
): HttpResponseResolver<Params, RequestBodyType, any> {
	return async (args) => {
		const { cookies } = args;

		if (!cookies.accessToken) {
			return new HttpResponse(null, { status: 401 });
		}

		return resolver(args);
	};
}
