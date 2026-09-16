import { User, IdCard, Hash, Mail, FileText, BookUser } from "lucide-react";
import type { SearchContext } from "@/types";

interface FieldDef {
  key: keyof SearchContext;
  label: string;
  icon: typeof User;
}

const FIELDS: FieldDef[] = [
  { key: "customerId", label: "Customer ID", icon: User },
  { key: "accountNo", label: "Account no.", icon: Hash },
  { key: "accountCode", label: "Account code", icon: BookUser },
  { key: "partyId", label: "Party ID", icon: BookUser },
  { key: "contractId", label: "Contract ID", icon: FileText },
  { key: "email", label: "Email", icon: Mail },
  { key: "emiratedId", label: "Emirates ID", icon: IdCard },
  { key: "passport", label: "Passport", icon: IdCard },
];

/**
 * Left side panel: read-only view of the active Search Context (proposal
 * §3.2). Purely a Shell-owned display of Shell-owned state — MFEs read the
 * same context via the mount contract, they don't manage it.
 */
export function CustomerPanel({
  search,
  collapsed,
}: {
  search: SearchContext | null;
  collapsed: boolean;
}) {
  if (collapsed) return null;

  if (!search) {
    return (
      <aside className="flex w-72 shrink-0 flex-col border-r border-shell-border bg-white p-4 text-sm text-slate-400">
        No active search. Open a customer interaction to see context here.
      </aside>
    );
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-r border-shell-border bg-white">
      <div className="border-b border-shell-border p-4">
        <p className="text-xs uppercase text-slate-400">Active search</p>
        <p className="mt-1 text-base font-semibold text-slate-800">{search.label}</p>
        <p className="text-xs text-slate-400">{search.searchId}</p>
      </div>

      <dl className="flex-1 divide-y divide-shell-border">
        {FIELDS.map(({ key, label, icon: Icon }) => {
          const value = search[key];
          if (!value) return null;
          return (
            <div key={key} className="flex items-start gap-3 px-4 py-3">
              <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <dt className="text-[11px] text-slate-400">{label}</dt>
                <dd className="truncate text-sm font-medium text-slate-700">{String(value)}</dd>
              </div>
            </div>
          );
        })}
      </dl>
    </aside>
  );
}
