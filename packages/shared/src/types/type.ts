import type { getPaginatedMeta } from "../utils/util";

export type MetaPagination = ReturnType<typeof getPaginatedMeta>;

export interface PaginatedResponse<T> extends MetaPagination {
	data: T[];
}
