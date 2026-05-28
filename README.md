# @crestdeploymentsystems/verify-mcp

[![Crest Verify](https://crestsystems.ai/api/badge?url=https://supership.crestsystems.ai/attest)](https://crestsystems.ai/api/verify?url=https://supership.crestsystems.ai/attest)

MCP server for Crest Verify. Check any x402 endpoint before your agent spends.

## Install

### Claude Code

```bash
claude mcp add crest-verify npx @crestdeploymentsystems/verify-mcp
```

### Cursor / Windsurf / Continue

Add to your MCP config (`.cursor/mcp.json`, etc.):

```json
{
  "mcpServers": {
    "crest-verify": {
      "command": "npx",
      "args": ["@crestdeploymentsystems/verify-mcp"]
    }
  }
}
```

## Tools

### `verify`
Quick check. Returns **SPEND / CAUTION / INVESTIGATE / DO NOT SPEND** backed by 50K+ classified services.

### `passport`
Full trust identity: score, grade, methodology, on-chain observation, receipt history, provider paths.

### `risk_check`
Deep risk assessment with anomaly detection and scoring methodology.

## API

All tools call the public Crest Verify API:
- `verify` -> `crestsystems.ai/api/verify`
- `passport` -> `supership.crestsystems.ai/passport`
- `risk_check` -> `supership.crestsystems.ai/v1/risk-check`

No API keys required. No signup. No payment.

## Also available

- **CLI**: `npx @crestdeploymentsystems/verify <url>`
- **API**: `curl https://crestsystems.ai/api/verify?url=<endpoint>`
- **Badge**: `![](https://crestsystems.ai/api/badge?url=<endpoint>)`

## License

MIT. Crest Deployment Systems LLC.
