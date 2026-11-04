import { NextRequest, NextResponse } from "next/server";
import { runCompleteMigration } from "../../../../../prisma/migrate-plans";
import { getCurrentUser } from "@/lib/auth-utils";

function isAuthorized(req: NextRequest, secretFromBody?: string): boolean {
  const url = new URL(req.url);
  const providedKey =
    url.searchParams.get("key") ||
    url.searchParams.get("secret") ||
    req.headers.get("x-admin-secret") ||
    secretFromBody;

  const validSecrets = [
    process.env.ADMIN_SECRET,
    process.env.NEXTAUTH_SECRET,
    process.env.CRON_SECRET,
    process.env.SUPER_ADMIN_PASSWORD,
  ].filter(Boolean) as string[];

  // If a valid key is provided
  if (providedKey && validSecrets.includes(providedKey)) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const hasSecret = isAuthorized(req);

  // If authorized via query param or session, execute migration immediately
  if (isSuperAdmin || hasSecret) {
    try {
      const result = await runCompleteMigration();
      return NextResponse.json(
        {
          status: result.success ? "success" : "partial_failure",
          message: result.success
            ? "Database schema, enums, tables, and 5-tier plan configs successfully synced!"
            : "Migration completed with notices. Check logs.",
          logs: result.logs,
        },
        { status: result.success ? 200 : 500 }
      );
    } catch (err) {
      return NextResponse.json(
        {
          status: "error",
          error: (err as Error).message,
        },
        { status: 500 }
      );
    }
  }

  // If unauthorized, return a self-contained HTML form allowing the user to enter their secret
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TapGenie — Database Deploy &amp; Migration Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
        ⚡
      </div>
      <div>
        <h1 class="text-xl font-black text-white">TapGenie DB Sync</h1>
        <p class="text-xs text-slate-400">Coolify &amp; Cloud Database Deployer</p>
      </div>
    </div>

    <p class="text-xs text-slate-300 mb-6 leading-relaxed">
      This tool updates PostgreSQL Enums, creates missing columns, syncs the 5-Tier plans (Lite, Starter, Growth, Business, Enterprise), and verifies your Super Admin account.
    </p>

    <form id="migrateForm" class="space-y-4">
      <div>
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Admin Secret or NEXTAUTH_SECRET
        </label>
        <input
          type="password"
          id="secret"
          required
          placeholder="Enter NEXTAUTH_SECRET or SUPER_ADMIN_PASSWORD"
          class="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        id="submitBtn"
        class="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
      >
        Run Database Migration &amp; Sync
      </button>
    </form>

    <div id="statusBox" class="mt-6 hidden">
      <div class="p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto" id="output">
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('migrateForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusBox = document.getElementById('statusBox');
    const output = document.getElementById('output');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const secret = document.getElementById('secret').value;
      submitBtn.disabled = true;
      submitBtn.innerText = 'Migrating Database...';
      statusBox.classList.remove('hidden');
      output.className = 'p-4 rounded-2xl text-xs font-mono bg-slate-950 border border-slate-800 text-teal-300';
      output.innerText = 'Connecting to database and running migration...\\n';

      try {
        const res = await fetch('/api/system/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret })
        });
        const data = await res.json();
        
        if (res.ok) {
          output.className = 'p-4 rounded-2xl text-xs font-mono bg-emerald-950/60 border border-emerald-500/40 text-emerald-200';
          output.innerText = '✅ SUCCESS!\\n\\n' + (data.logs || []).join('\\n') + '\\n\\n' + data.message;
          submitBtn.innerText = 'Migration Completed ✅';
        } else {
          output.className = 'p-4 rounded-2xl text-xs font-mono bg-rose-950/60 border border-rose-500/40 text-rose-200';
          output.innerText = '❌ FAILED: ' + (data.error || data.message || 'Unauthorized secret');
          submitBtn.disabled = false;
          submitBtn.innerText = 'Try Again';
        }
      } catch (err) {
        output.className = 'p-4 rounded-2xl text-xs font-mono bg-rose-950/60 border border-rose-500/40 text-rose-200';
        output.innerText = '❌ Network Error: ' + err.message;
        submitBtn.disabled = false;
        submitBtn.innerText = 'Try Again';
      }
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function POST(req: NextRequest) {
  try {
    let secretFromBody: string | undefined;
    try {
      const body = await req.json();
      secretFromBody = body?.secret;
    } catch {}

    const user = await getCurrentUser();
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
    const hasSecret = isAuthorized(req, secretFromBody);

    if (!isSuperAdmin && !hasSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid secret or log in as super admin." },
        { status: 401 }
      );
    }

    const result = await runCompleteMigration();
    return NextResponse.json(
      {
        status: result.success ? "success" : "partial_failure",
        message: result.success
          ? "Database schema, enums, tables, and 5-tier plan configs successfully synced!"
          : "Migration completed with warnings. Check logs.",
        logs: result.logs,
      },
      { status: result.success ? 200 : 500 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: (err as Error).message,
      },
      { status: 500 }
    );
  }
}
