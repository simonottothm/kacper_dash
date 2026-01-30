export interface LeadQueryParams {
  q?: string;
  status?: string;
  followup?: "overdue" | "today" | "none" | "";
  sort?: "updated_desc" | "created_desc" | "followup_asc";
  page?: number;
}

export function parseLeadQueryParams(searchParams: URLSearchParams): LeadQueryParams {
  const q = searchParams.get("q") || undefined;
  const status = searchParams.get("status") || undefined;
  const followup = searchParams.get("followup") as "overdue" | "today" | "none" | "" | null;
  const sort = searchParams.get("sort") as "updated_desc" | "created_desc" | "followup_asc" | null;
  const pageStr = searchParams.get("page");
  const page = pageStr ? parseInt(pageStr, 10) : undefined;

  return {
    q,
    status,
    followup: followup || undefined,
    sort: sort || undefined,
    page: page && !isNaN(page) ? page : undefined,
  };
}

export function buildLeadQueryString(params: LeadQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set("q", params.q);
  }
  if (params.status) {
    searchParams.set("status", params.status);
  }
  if (params.followup) {
    searchParams.set("followup", params.followup);
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.page && params.page > 1) {
    searchParams.set("page", params.page.toString());
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

