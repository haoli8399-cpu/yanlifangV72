import { defineTool } from "@lovable.dev/mcp-js";
import { FIXTURE_LABELS } from "@/features/demand/fixtures";

export default defineTool({
  name: "list_demand_fixtures",
  title: "List demo demand fixtures",
  description:
    "List the demo demand-flow scenarios (fixtures) available in this app. Returns each fixture's stable key and its Chinese business label. Use the key with get_demand_brief.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const rows = Object.entries(FIXTURE_LABELS).map(([key, label]) => ({ key, label }));
    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { fixtures: rows },
    };
  },
});
