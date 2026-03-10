import type { Role } from "@urlshortener/common/types";
import type { LogsBindings } from "@urlshortener/infra/factories";
import { createFactory } from "hono/factory";

export type Group = { id: string; role: Role; name: string };

export type AuthBindings = {
	Variables: {
		userId: string;
		groups: Group[];
	};
} & LogsBindings;

export const appWithAuth = createFactory<AuthBindings>();
