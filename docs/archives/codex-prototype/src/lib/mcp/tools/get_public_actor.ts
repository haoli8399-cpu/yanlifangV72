import { defineTool } from "@lovable.dev/mcp-js";
import { getPublicActor } from "@/features/demand/fixtures";

export default defineTool({
  name: "get_public_actor",
  title: "Get demo public actor profile",
  description:
    "Fetch the demo public actor profile (Lin Zhou) that seeds the demand flow. Returns the actor's public fields, verification status, and current_brief link if any. Desensitized demo data.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const resp = getPublicActor();
    return {
      content: [{ type: "text", text: JSON.stringify(resp, null, 2) }],
      structuredContent: resp,
    };
  },
});
