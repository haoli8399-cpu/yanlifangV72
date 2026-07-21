import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listFixtures from "./tools/list_fixtures";
import getDemandBrief from "./tools/get_demand_brief";
import getPublicActor from "./tools/get_public_actor";

// The OAuth issuer MUST be the direct Supabase host. VITE_SUPABASE_PROJECT_ID
// is inlined at build time by Vite; the sentinel fallback keeps the config
// well-formed during the manifest-extract pass when the literal is unset.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "yanlicube-demand-mcp",
  title: "演立方 · Demand MCP",
  version: "0.1.0",
  instructions:
    "Read-only tools for the 演立方 demand-flow demo. Use list_demand_fixtures to discover the 11 desensitized demo scenarios, then get_demand_brief to inspect a scenario's customer/tenant views, or get_public_actor for the seed actor profile. All data is demo fixtures — no real people, no live database.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listFixtures, getDemandBrief, getPublicActor],
});
