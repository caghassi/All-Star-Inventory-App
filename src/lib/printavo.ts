// Printavo GraphQL API v2 client.
// Docs: https://printavo.com/api (requires an account with API access).
//
// Auth is done via two headers:
//   email: <PRINTAVO_EMAIL>
//   token: <PRINTAVO_TOKEN>
//
// The schema exposes `invoices` and `quotes` as connections. We paginate with
// a cursor and pull the last ~13 months so we always have a full year of
// history for reorder matching.

const ENDPOINT = "https://www.printavo.com/api/v2";

export type PrintavoLineItem = {
  description?: string | null;
  quantity?: number | null;
  price?: number | null;
};

export type PrintavoInvoice = {
  id: string;
  visualId?: string | null;
  nickname?: string | null;
  total?: number | null;
  dueAt?: string | null;
  createdAt?: string | null;
  status?: { name?: string | null } | null;
  customer?: {
    id?: string | null;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  tags?: Array<{ name?: string | null } | string> | null;
  lineItemGroups?: Array<{
    lineItems?: PrintavoLineItem[] | null;
  }> | null;
};

export type PrintavoPage<T> = {
  nodes: T[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

function getCreds(): { email: string; token: string } {
  const email = process.env.PRINTAVO_EMAIL;
  const token = process.env.PRINTAVO_TOKEN;
  if (!email || !token) {
    throw new Error(
      "PRINTAVO_EMAIL and PRINTAVO_TOKEN must be set in the environment"
    );
  }
  return { email, token };
}

export async function printavoGql<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const { email, token } = getCreds();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      email,
      token,
    },
    body: JSON.stringify({ query, variables }),
    // Never cache API responses.
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Printavo ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(`Printavo GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("Printavo returned no data");
  }
  return json.data;
}

const INVOICES_QUERY = /* GraphQL */ `
  query Invoices($first: Int!, $after: String, $inProductionAfter: ISO8601DateTime) {
    invoices(first: $first, after: $after, inProductionAfter: $inProductionAfter, sortOn: DUE_AT, sortDescending: false) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        visualId
        nickname
        total
        dueAt
        createdAt
        status { name }
        customer {
          id
          companyName
          email
          phone
        }
        tags { name }
        lineItemGroups { lineItems { description quantity price } }
      }
    }
  }
`;

export async function fetchInvoicesPage(
  after: string | null,
  since: Date
): Promise<PrintavoPage<PrintavoInvoice>> {
  const data = await printavoGql<{ invoices: PrintavoPage<PrintavoInvoice> }>(
    INVOICES_QUERY,
    {
      first: 50,
      after,
      inProductionAfter: since.toISOString(),
    }
  );
  return data.invoices;
}

/**
 * Pull all invoices created on/after `since`. Paginates server-side.
 */
export async function* iterateInvoicesSince(since: Date): AsyncGenerator<PrintavoInvoice> {
  let cursor: string | null = null;
  for (;;) {
    const page = await fetchInvoicesPage(cursor, since);
    for (const n of page.nodes) yield n;
    if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) return;
    cursor = page.pageInfo.endCursor;
  }
}
