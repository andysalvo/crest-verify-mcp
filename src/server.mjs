import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const VERIFY_API = "https://crestsystems.ai/api/verify";
const SUPERSHIP_API = "https://supership.crestsystems.ai";
const VERSION = "0.1.0";

const server = new McpServer({
  name: "crest-verify",
  version: VERSION,
});

server.tool(
  "verify",
  "Check any x402 endpoint before spending. Returns SPEND / CAUTION / INVESTIGATE / DO NOT SPEND with classification evidence from 50K+ indexed services.",
  { url: z.string().url().describe("The x402 endpoint URL to verify") },
  async ({ url }) => {
    try {
      const res = await fetch(`${VERIFY_API}?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Verify API returned ${res.status}. The service may be temporarily unavailable. Try again or use the CLI: npx @crestdeploymentsystems/verify ${url}`,
            },
          ],
        };
      }
      const data = await res.json();
      const lines = [
        `## ${data.judgment}`,
        "",
        `**URL:** ${data.url}`,
        `**Classification:** ${data.classification}`,
        data.distinct_score != null
          ? `**Distinct Score:** ${data.distinct_score}`
          : null,
        data.provider ? `**Provider:** ${data.provider}` : null,
        data.provider_listings
          ? `**Provider Listings:** ${data.provider_listings}`
          : null,
        data.convergence_zone != null
          ? `**Convergence Zone:** ${data.convergence_zone}`
          : null,
        data.near_neighbors != null
          ? `**Near Neighbors:** ${data.near_neighbors}`
          : null,
        data.liveness ? `**Liveness:** ${data.liveness}` : null,
        `**Census Match:** ${data.census_match}`,
        data.reason ? `**Reason:** ${data.reason}` : null,
        "",
        `Checked at ${data.checked_at}`,
        `Source: crestsystems.ai/api/verify`,
      ].filter(Boolean);

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to reach Crest Verify API: ${err.message}. Try the CLI: npx @crestdeploymentsystems/verify ${url}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "passport",
  "Get the full trust identity for an x402 service: trust score, grade, methodology, on-chain observation data, receipt history, and provider improvement paths.",
  { url: z.string().url().describe("The x402 service URL to look up") },
  async ({ url }) => {
    try {
      const res = await fetch(
        `${SUPERSHIP_API}/passport?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Supership returned ${res.status}. Try: curl '${SUPERSHIP_API}/passport?url=${url}'`,
            },
          ],
        };
      }
      const data = await res.json();
      if (!data.found) {
        return {
          content: [
            {
              type: "text",
              text: `Service not found in the Supership index (51K+ services). ${data.message || ""}\nSubmit receipts to get indexed: POST ${SUPERSHIP_API}/receipt`,
            },
          ],
        };
      }
      const p = data.passport;
      const lines = [
        `## Passport: ${p.service_url}`,
        "",
        `**Host:** ${p.host}`,
        p.description ? `**Description:** ${p.description}` : null,
        `**Network:** ${p.network}`,
        `**Price:** $${p.price_usd} USDC`,
        "",
        `### Trust`,
        `**Score:** ${p.trust.score}/100 (Grade: ${p.trust.grade})`,
        `**Recommendation:** ${p.trust.recommendation}`,
        `**Basis:** ${p.trust.basis}`,
        `**Calls (30d):** ${p.trust.calls_30d}`,
        `**Payers (30d):** ${p.trust.payers_30d}`,
        `**First Seen:** ${p.trust.first_seen}`,
        `**Last Seen:** ${p.trust.last_seen}`,
        "",
        `### Receipts`,
        `**Total:** ${p.receipts.total}`,
        p.receipts.success_rate != null
          ? `**Success Rate:** ${p.receipts.success_rate}`
          : null,
        "",
        `**Percentile:** Top ${100 - p.index.percentile}% of ${p.index.total_services} indexed services`,
        "",
        `Source: supership.crestsystems.ai/passport`,
      ].filter(Boolean);

      return { content: [{ type: "text", text: lines.join("\n") }] };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to reach Supership: ${err.message}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "risk_check",
  "Deep risk assessment for an x402 endpoint. Returns risk signals, anomaly detection, and detailed scoring methodology.",
  { url: z.string().url().describe("The x402 endpoint URL to assess") },
  async ({ url }) => {
    try {
      const res = await fetch(
        `${SUPERSHIP_API}/v1/risk-check?url=${encodeURIComponent(url)}`
      );
      if (!res.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Risk check returned ${res.status}. Service may be unavailable.`,
            },
          ],
        };
      }
      const data = await res.json();
      return {
        content: [
          {
            type: "text",
            text: `## Risk Check: ${url}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\nSource: supership.crestsystems.ai/v1/risk-check`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to reach risk-check endpoint: ${err.message}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
