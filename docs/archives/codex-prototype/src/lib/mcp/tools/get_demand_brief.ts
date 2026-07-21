import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getCustomerFixture, getTenantFixture, FIXTURE_LABELS } from "@/features/demand/fixtures";

const KEYS = Object.keys(FIXTURE_LABELS) as [string, ...string[]];

export default defineTool({
  name: "get_demand_brief",
  title: "Get demo demand brief",
  description:
    "Fetch a single demo demand-brief scenario by its fixture key. Returns the customer-side view (brief, facts, source_intent, matching_consent, display_status, available_actions). For scenario 'tenant_authorized_workspace', also includes the tenant workspace view. All data is desensitized demo content.",
  inputSchema: {
    fixture_key: z
      .enum(KEYS)
      .describe("The fixture key. Get available keys from list_demand_fixtures."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ fixture_key }) => {
    const customer = getCustomerFixture(fixture_key as never);
    const tenant =
      fixture_key === "tenant_authorized_workspace" ? getTenantFixture(fixture_key as never) : null;

    if (!customer && !tenant?.data) {
      return {
        content: [{ type: "text", text: `No fixture found for key "${fixture_key}".` }],
        isError: true,
      };
    }

    const payload = {
      fixture_key,
      label: FIXTURE_LABELS[fixture_key as keyof typeof FIXTURE_LABELS],
      customer_view: customer,
      tenant_view: tenant,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
