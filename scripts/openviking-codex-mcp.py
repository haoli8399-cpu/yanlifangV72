#!/Users/wudixingyunxingleo/miniconda3/bin/python3.13
"""Read-only Codex adapter for the local Yanlifang OpenViking namespace.

The native OpenViking HTTP MCP is real and remains available at /mcp, but the
Mac's system proxy can intercept localhost traffic from Codex. This stdio
adapter uses the installed OpenViking 0.4.6 CLI with an explicit NO_PROXY and
exposes only project-scoped read/retrieval tools. Governed writeback stays in
scripts/project-memory.mjs.
"""

from __future__ import annotations

import json
import os
import subprocess
import urllib.request
from typing import Any

from mcp.server.fastmcp import FastMCP


PROJECT_URI = "viking://user/default/resources/yanlifang-project-memory"
OPENVIKING = "/Users/wudixingyunxingleo/miniconda3/bin/openviking"
BASE_URL = "http://127.0.0.1:1933"

mcp = FastMCP("yanlifang-openviking")


def _assert_project_uri(uri: str) -> str:
    value = uri.strip() or PROJECT_URI
    if value != PROJECT_URI and not value.startswith(f"{PROJECT_URI}/"):
        raise ValueError(f"URI is outside the Yanlifang project namespace: {value}")
    return value


def _ov(*args: str) -> Any:
    env = dict(os.environ)
    env["NO_PROXY"] = "127.0.0.1,localhost,::1"
    env["no_proxy"] = "127.0.0.1,localhost,::1"
    command = [
        OPENVIKING,
        "--account",
        "default",
        "--user",
        "default",
        *args,
        "-o",
        "json",
    ]
    result = subprocess.run(command, capture_output=True, text=True, env=env, timeout=90)
    if result.returncode != 0:
        raise RuntimeError((result.stderr or result.stdout).strip())
    output = result.stdout.strip()
    start = output.find("{")
    if start < 0:
        raise RuntimeError(f"OpenViking returned non-JSON output: {output[:300]}")
    parsed = json.loads(output[start:])
    if not parsed.get("ok"):
        raise RuntimeError(json.dumps(parsed, ensure_ascii=False))
    return parsed.get("result")


@mcp.tool()
def health() -> dict[str, Any]:
    """Check OpenViking /ready. This is the mandatory readiness gate."""
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with opener.open(f"{BASE_URL}/ready", timeout=40) as response:
        body = json.loads(response.read().decode("utf-8"))
    return {
        "healthy": body.get("status") == "ready"
        and body.get("checks", {}).get("embedding") == "ok"
        and body.get("checks", {}).get("vectordb") == "ok",
        "status": body,
        "project_uri": PROJECT_URI,
    }


@mcp.tool()
def find(query: str, target_uri: str = PROJECT_URI, limit: int = 5) -> Any:
    """Semantic retrieval inside the Yanlifang project memory namespace."""
    uri = _assert_project_uri(target_uri)
    safe_limit = max(1, min(int(limit), 10))
    return _ov(
        "find",
        query,
        "--uri",
        uri,
        "--node-limit",
        str(safe_limit),
        "--threshold",
        "0",
    )


@mcp.tool()
def read(uri: str) -> Any:
    """Read one exact Yanlifang memory resource, including the manifest."""
    return _ov("read", _assert_project_uri(uri))


@mcp.tool(name="list")
def list_resources(uri: str = PROJECT_URI, recursive: bool = False) -> Any:
    """List resources inside the Yanlifang project namespace."""
    args = ["ls", _assert_project_uri(uri), "--node-limit", "200"]
    if recursive:
        args.append("--recursive")
    return _ov(*args)


@mcp.tool()
def grep(pattern: str, uri: str = PROJECT_URI) -> Any:
    """Exact text search inside the Yanlifang project namespace."""
    return _ov("grep", pattern, "--uri", _assert_project_uri(uri), "--node-limit", "50")


if __name__ == "__main__":
    mcp.run(transport="stdio")
