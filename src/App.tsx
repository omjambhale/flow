import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  BookOpenCheck,
  Boxes,
  BrainCircuit,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Download,
  ExternalLink,
  Factory,
  FileCheck2,
  FileSpreadsheet,
  FileWarning,
  Filter,
  GraduationCap,
  History,
  IndianRupee,
  LayoutDashboard,
  LifeBuoy,
  Lightbulb,
  Link2,
  MapPin,
  MapPinned,
  Menu,
  MessageSquareWarning,
  Minus,
  MoreHorizontal,
  PackageCheck,
  PanelLeftClose,
  RadioTower,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  TrendingUp,
  Truck,
  UploadCloud,
  UserCheck,
  UserPlus,
  UserRoundCog,
  UsersRound,
  Video,
  WalletCards,
  WifiOff,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  assets,
  docs,
  initialActions,
  invoices as invoiceData,
  milestones,
  people,
  production,
  qualityIssues as issueData,
  qualityMix,
  siteName,
  sites,
  trendData,
  uploads,
  type ActionItem,
  type Asset,
  type Person,
  type QualityIssue,
  type Site,
} from "./data";

type Page =
  | "Home"
  | "Sites"
  | "People"
  | "Live Operations"
  | "Production"
  | "Quality"
  | "Hardware"
  | "Payments"
  | "Help & SOPs";
type Filters = {
  date: string;
  project: string;
  site: string;
  shift: string;
  status: string;
};
type ToastState = { title: string; detail: string } | null;

const navItems: {
  label: Page;
  navigationLabel?: string;
  icon: LucideIcon;
  alert?: number;
}[] = [
  { label: "Home", navigationLabel: "HL overview", icon: LayoutDashboard },
  { label: "Sites", navigationLabel: "Sites home", icon: MapPinned },
  { label: "People", icon: UsersRound },
  { label: "Live Operations", icon: RadioTower, alert: 3 },
  { label: "Production", icon: TrendingUp },
  { label: "Quality", icon: BadgeCheck, alert: 4 },
  { label: "Hardware", icon: Camera, alert: 2 },
  { label: "Payments", icon: WalletCards },
  { label: "Help & SOPs", icon: LifeBuoy },
];

const navGroups: { label: string; items: Page[] }[] = [
  {
    label: "Sites",
    items: [
      "Sites",
      "People",
      "Live Operations",
      "Production",
      "Quality",
      "Hardware",
    ],
  },
  { label: "HL", items: ["Home", "Payments", "Help & SOPs"] },
];

const mobileNav: { label: Page; shortLabel: string; icon: LucideIcon }[] = [
  { label: "Sites", shortLabel: "Sites", icon: MapPinned },
  { label: "People", shortLabel: "People", icon: UsersRound },
  { label: "Live Operations", shortLabel: "Live", icon: RadioTower },
  { label: "Home", shortLabel: "HL", icon: LayoutDashboard },
];

const mobileMoreGroups: { label: string; items: Page[] }[] = [
  { label: "Site tools", items: ["Production", "Quality", "Hardware"] },
  { label: "Humyn Labs", items: ["Payments", "Help & SOPs"] },
];

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toneClass: Record<string, string> = {
  Live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Ready: "bg-teal-50 text-teal-700 border-teal-200",
  Review: "bg-amber-50 text-amber-700 border-amber-200",
  "At risk": "bg-red-50 text-red-700 border-red-200",
  Paused: "bg-slate-100 text-slate-600 border-slate-200",
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Valid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In use": "bg-teal-50 text-teal-700 border-teal-200",
  "In transit": "bg-sky-50 text-sky-700 border-sky-200",
  Uploading: "bg-sky-50 text-sky-700 border-sky-200",
  Pending: "bg-slate-100 text-slate-700 border-slate-200",
  "Invite pending": "bg-slate-100 text-slate-700 border-slate-200",
  "Under review": "bg-amber-50 text-amber-700 border-amber-200",
  Scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  Acknowledged: "bg-sky-50 text-sky-700 border-sky-200",
  Recollecting: "bg-amber-50 text-amber-700 border-amber-200",
  Retraining: "bg-amber-50 text-amber-700 border-amber-200",
  "HL recheck": "bg-violet-50 text-violet-700 border-violet-200",
  New: "bg-red-50 text-red-700 border-red-200",
  Open: "bg-red-50 text-red-700 border-red-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Disputed: "bg-red-50 text-red-700 border-red-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  Damaged: "bg-red-50 text-red-700 border-red-200",
  Missing: "bg-red-50 text-red-700 border-red-200",
  Absent: "bg-red-50 text-red-700 border-red-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  Expiring: "bg-amber-50 text-amber-700 border-amber-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
};

function StatusPill({
  children,
  dot = true,
}: {
  children: ReactNode;
  dot?: boolean;
}) {
  const value = String(children);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${toneClass[value] ?? "border-slate-200 bg-slate-50 text-slate-600"}`}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      ) : null}
      {children}
    </span>
  );
}

function Severity({
  value,
}: {
  value: ActionItem["severity"] | QualityIssue["severity"];
}) {
  const cls =
    value === "Critical"
      ? "bg-critical text-white"
      : value === "High"
        ? "bg-red-50 text-red-700"
        : value === "Medium"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>
      {value}
    </span>
  );
}

function MetricCard({
  label,
  value,
  delta,
  detail,
  icon: Icon,
  tone = "teal",
  onClick,
}: {
  label: string;
  value: string;
  delta?: string;
  detail: string;
  icon: LucideIcon;
  tone?: "teal" | "green" | "amber" | "red";
  onClick?: () => void;
}) {
  const colors = {
    teal: "bg-teal/10 text-teal",
    green: "bg-green/10 text-green",
    amber: "bg-amber/10 text-amber",
    red: "bg-critical/10 text-critical",
  };
  return (
    <button
      onClick={onClick}
      title={detail}
      className="surface group min-w-0 p-3.5 text-left transition active:scale-[.99] sm:p-4 sm:hover:-translate-y-0.5 sm:hover:border-slate-300"
      aria-label={`${label}: ${value}. ${detail}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow leading-4">{label}</span>
        <span className={`rounded-md p-1.5 ${colors[tone]}`}>
          <Icon size={15} strokeWidth={1.8} />
        </span>
      </div>
      <div className="mt-3 flex min-w-0 items-end justify-between gap-2">
        <span className="min-w-0 break-words font-mono text-[21px] font-medium tracking-[-0.04em] text-navy sm:text-[24px]">
          {value}
        </span>
        {delta ? (
          <span
            className={`mb-1 flex items-center gap-0.5 text-[10px] font-semibold ${delta.startsWith("-") ? "text-critical" : "text-green"}`}
          >
            {delta.startsWith("-") ? (
              <ArrowDownRight size={11} />
            ) : (
              <ArrowUpRight size={11} />
            )}
            {delta.replace("-", "")}
          </span>
        ) : null}
      </div>
      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">
        {detail}
      </p>
    </button>
  );
}

function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-5 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow text-teal">{eyebrow}</p>
        <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.025em] text-navy sm:text-[22px]">
          {title}
        </h1>
      </div>
      {children ? (
        <div className="page-actions grid grid-cols-2 items-center gap-2 sm:flex">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
      </div>
      {action ? <div className="min-w-0 shrink-0">{action}</div> : null}
    </div>
  );
}

function EmptyState({
  icon: Icon = Search,
  title = "Nothing in this view",
  detail = "Try changing the current filters.",
}: {
  icon?: LucideIcon;
  title?: string;
  detail?: string;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
      <span className="rounded-full bg-slate-100 p-3 text-slate-400">
        <Icon size={22} />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-navy">{title}</h3>
      <p className="mt-1 max-w-xs text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Drawer({
  title,
  eyebrow,
  onClose,
  children,
  width = "max-w-xl",
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-navy/25 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <aside
        className={`drawer-scroll h-[100dvh] w-full ${width} overflow-y-auto overscroll-contain bg-white pb-[env(safe-area-inset-bottom)] shadow-drawer page-enter`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 z-10 flex min-h-[64px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4">
          <div>
            <p className="eyebrow text-teal">{eyebrow}</p>
            <h2 className="mt-1 text-lg font-semibold text-navy">{title}</h2>
          </div>
          <button
            className="btn-secondary !h-11 !w-11 !p-0 sm:!h-8 sm:!w-8"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        className="max-h-[94dvh] w-full max-w-lg overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-drawer page-enter sm:max-h-[90vh] sm:rounded-lg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sticky top-0 z-10 flex min-h-[64px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4">
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          <button
            className="btn-ghost !h-11 !w-11 !p-0 sm:!h-8 sm:!w-8"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FilterModal({
  filters,
  onApply,
  onClose,
}: {
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(filters);
  const update = (key: keyof Filters, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const reset = () =>
    setDraft({
      date: "Today · 03 Sep",
      project: "All projects",
      site: "All sites",
      shift: "All shifts",
      status: "All statuses",
    });
  return (
    <Modal title="Set operating scope" onClose={onClose}>
      <div className="p-4 sm:p-5">
        <p className="text-xs leading-5 text-slate-500">
          Use one scope across every dashboard. Your selection stays in place
          while you move between sections.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="label">Operating period</span>
            <select
              className="control mt-1 w-full"
              value={draft.date}
              onChange={(e) => update("date", e.target.value)}
            >
              <option>Today · 03 Sep</option>
              <option>Last 7 days</option>
              <option>August 2026</option>
            </select>
          </label>
          <label>
            <span className="label">Project</span>
            <select
              className="control mt-1 w-full"
              value={draft.project}
              onChange={(e) => update("project", e.target.value)}
            >
              <option>All projects</option>
              <option>Atlas</option>
              <option>Loom</option>
              <option>Harvest</option>
            </select>
          </label>
          <label>
            <span className="label">Site</span>
            <select
              className="control mt-1 w-full"
              value={draft.site}
              onChange={(e) => update("site", e.target.value)}
            >
              <option value="All sites">All 6 sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Shift</span>
            <select
              className="control mt-1 w-full"
              value={draft.shift}
              onChange={(e) => update("shift", e.target.value)}
            >
              <option>All shifts</option>
              <option>Shift A</option>
              <option>Shift B</option>
              <option>Shift C</option>
            </select>
          </label>
          <label>
            <span className="label">Status</span>
            <select
              className="control mt-1 w-full"
              value={draft.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option>All statuses</option>
              <option>Live</option>
              <option>Ready</option>
              <option>At risk</option>
              <option>Review</option>
              <option>Paused</option>
            </select>
          </label>
        </div>
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="eyebrow">Preview</p>
          <p className="mt-1.5 text-xs font-medium text-navy">
            {draft.date} · {draft.project} ·{" "}
            {draft.site === "All sites" ? "All sites" : siteName(draft.site)}
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            {draft.shift} · {draft.status}
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button className="btn-ghost w-full sm:w-auto" onClick={reset}>
            <RotateCcw size={13} />
            Reset
          </button>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                onApply(draft);
                onClose();
              }}
            >
              <Check size={14} />
              Apply scope
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

type CommandItem = {
  id: string;
  title: string;
  meta: string;
  icon: LucideIcon;
  run: () => void;
};

function CommandPalette({
  onClose,
  onPage,
  onSite,
  onPerson,
  onAsset,
  onAction,
}: {
  onClose: () => void;
  onPage: (page: Page) => void;
  onSite: (site: Site) => void;
  onPerson: (person: Person) => void;
  onAsset: (asset: Asset) => void;
  onAction: (action: ActionItem) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const items: CommandItem[] = [
    ...navItems.map((item) => ({
      id: `page-${item.label}`,
      title: item.navigationLabel ?? item.label,
      meta:
        item.label === "Home"
          ? "Humyn Labs workspace"
          : item.label === "Sites"
            ? "Sites workspace"
            : "Go to section",
      icon: item.icon,
      run: () => onPage(item.label),
    })),
    ...sites.map((site) => ({
      id: `site-${site.id}`,
      title: site.name,
      meta: `Site · ${site.id} · ${site.city}`,
      icon: Factory,
      run: () => {
        onPage("Sites");
        onSite(site);
      },
    })),
    ...people.map((person) => ({
      id: `person-${person.id}`,
      title: person.name,
      meta: `${person.role} · ${siteName(person.siteId)}`,
      icon: UsersRound,
      run: () => {
        onPage("People");
        onPerson(person);
      },
    })),
    ...assets.map((asset) => ({
      id: `asset-${asset.id}`,
      title: asset.id,
      meta: `${asset.type} · ${asset.holder} · ${asset.status}`,
      icon: Camera,
      run: () => {
        onPage("Hardware");
        onAsset(asset);
      },
    })),
    ...initialActions.map((action) => ({
      id: `action-${action.id}`,
      title: action.title,
      meta: `Action · ${siteName(action.siteId)} · ${action.severity}`,
      icon: AlertTriangle,
      run: () => onAction(action),
    })),
  ];
  const visible = q
    ? items
        .filter((item) =>
          `${item.title} ${item.meta}`.toLowerCase().includes(q),
        )
        .slice(0, 10)
    : [
        items[0],
        items[3],
        items[6],
        items[7],
        items[9],
        items[15],
        items[25],
      ].filter(Boolean);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/35 p-0 backdrop-blur-[2px] sm:items-start sm:px-4 sm:pt-[12vh]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        className="max-h-[92dvh] w-full max-w-2xl overflow-hidden rounded-t-2xl border border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-drawer page-enter sm:rounded-lg sm:pb-0"
        role="dialog"
        aria-modal="true"
        aria-label="Search and navigate"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4">
          <Search size={18} className="shrink-0 text-teal" />
          <input
            autoFocus
            className="h-14 flex-1 bg-transparent text-sm text-navy placeholder:text-slate-400"
            placeholder="Search anything…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
          <span className="hidden rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 sm:inline">
            ESC
          </span>
        </div>
        <div className="max-h-[calc(92dvh-3.5rem)] overflow-y-auto overscroll-contain p-2 sm:max-h-[430px]">
          <p className="px-3 pb-2 pt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {q ? `${visible.length} matches` : "Suggested shortcuts"}
          </p>
          {visible.length ? (
            visible.map((item) => {
              const ItemIcon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-slate-100 text-slate-500 group-hover:bg-teal/10 group-hover:text-teal">
                    <ItemIcon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-navy">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                      {item.meta}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-slate-400 opacity-0 transition group-hover:opacity-100">
                    Open <ChevronRight size={11} />
                  </span>
                </button>
              );
            })
          ) : (
            <EmptyState
              icon={Search}
              title="No matches"
              detail="Try a site ID, person, asset, action or section name."
            />
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-slate-100 bg-slate-50 px-4 py-2 text-[9px] text-slate-400 sm:flex">
          <span>Tab to navigate</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
          <span className="ml-auto">Partner-scoped results only</span>
        </div>
      </div>
    </div>
  );
}

function TabStrip({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-slate-200 px-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`min-h-11 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-medium transition ${active === tab ? "border-teal text-teal" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function Progress({
  value,
  tone = "teal",
}: {
  value: number;
  tone?: "teal" | "green" | "amber" | "red";
}) {
  const colors = {
    teal: "bg-teal",
    green: "bg-green",
    amber: "bg-amber",
    red: "bg-critical",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${colors[tone]}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full min-w-0 sm:min-w-[220px] sm:max-w-sm">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={14}
      />
      <input
        className="control w-full pl-8"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function SiteLabel({ siteId }: { siteId: string }) {
  return (
    <div>
      <p className="font-medium text-navy">{siteName(siteId)}</p>
      <p className="mt-0.5 font-mono text-[10px] text-slate-400">{siteId}</p>
    </div>
  );
}

function displayRole(person: Person) {
  return person.role === "Site manager" ? "Supervisor" : person.role;
}

function supervisorFor(person: Person) {
  return (
    person.supervisorInCharge ??
    people.find(
      (candidate) =>
        candidate.siteId === person.siteId && candidate.role === "Site manager",
    )?.name ??
    sites.find((site) => site.id === person.siteId)?.manager ??
    "Not assigned"
  );
}

function operatorFor(person: Person) {
  return (
    person.operatorInCharge ??
    people.find(
      (candidate) =>
        candidate.siteId === person.siteId &&
        candidate.role === "Operator" &&
        (candidate.shift === person.shift ||
          candidate.shift.includes(person.shift)),
    )?.name ??
    people.find(
      (candidate) =>
        candidate.siteId === person.siteId && candidate.role === "Operator",
    )?.name ??
    "Not assigned"
  );
}

function hardwareFor(person: Person) {
  const held = assets.filter((asset) => asset.holder === person.name);
  return {
    camera:
      person.cameraAssigned ??
      held.find((asset) => asset.type === "Camera")?.id,
    sdCard:
      person.sdCardAssigned ??
      held.find((asset) => asset.type === "SD card")?.id,
    phone:
      person.uploadDevice ?? held.find((asset) => asset.type === "Phone")?.id,
  };
}

function hardwareSummary(person: Person) {
  const assigned = hardwareFor(person);
  return (
    [assigned.camera, assigned.sdCard, assigned.phone]
      .filter(Boolean)
      .join(" · ") || "Not assigned"
  );
}

function SkeletonPage() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-14 w-72 rounded-lg" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((x) => (
          <div key={x} className="skeleton h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="skeleton h-96 rounded-lg" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    </div>
  );
}

const Sidebar = memo(function Sidebar({
  page,
  onPage,
  onProfile,
  collapsed,
  onCollapse,
}: {
  page: Page;
  onPage: (page: Page) => void;
  onProfile: () => void;
  collapsed: boolean;
  onCollapse: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-navy text-white lg:flex ${collapsed ? "w-[72px]" : "w-[218px]"} transition-[width] duration-200`}
    >
      <div
        className={`flex h-[66px] items-center border-b border-white/10 ${collapsed ? "justify-center" : "px-4"}`}
      >
        <button
          onClick={onProfile}
          className="flex items-center gap-2.5 rounded-md text-left"
          aria-label="Open profile and settings"
          title="Profile & settings"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/20 bg-white/10 font-mono text-xs font-medium">
            H
          </span>
          {collapsed ? null : (
            <span>
              <span className="block text-[13px] font-semibold tracking-wide">
                humyn <span className="font-normal text-white/65">(labs)</span>
              </span>
              <span className="block text-[9px] uppercase tracking-[0.18em] text-white/45">
                Partner operations
              </span>
            </span>
          )}
        </button>
      </div>
      <nav
        className="flex-1 overflow-y-auto px-2 py-3"
        aria-label="Primary navigation"
      >
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex ? "mt-4" : ""}>
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-7 bg-white/10" />
            ) : (
              <div className="mb-1.5 flex items-center justify-between px-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  {group.label}
                </p>
                <span className="text-[8px] uppercase tracking-[0.12em] text-white/25">
                  {group.label === "HL" ? "partnership" : "6 factories"}
                </span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((label) => {
                const item = navItems.find((entry) => entry.label === label)!;
                const Icon = item.icon;
                return (
                  <button
                    key={label}
                    title={collapsed ? label : undefined}
                    onClick={() => onPage(label)}
                    className={`group flex h-9 w-full items-center rounded-md text-[12px] font-medium transition ${collapsed ? "justify-center px-0" : "gap-3 px-3"} ${page === label ? "bg-white text-navy shadow-sm" : "text-white/68 hover:bg-white/8 hover:text-white"}`}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                    {collapsed ? null : (
                      <>
                        <span className="flex-1 text-left">
                          {item.navigationLabel ?? label}
                        </span>
                        {item.alert ? (
                          <span
                            className={`min-w-5 rounded-full px-1.5 py-0.5 text-center font-mono text-[9px] ${page === label ? "bg-critical/10 text-critical" : "bg-white/10 text-white/70"}`}
                          >
                            {item.alert}
                          </span>
                        ) : null}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-2">
        <button
          onClick={onCollapse}
          className={`flex h-9 w-full items-center rounded-md text-white/55 hover:bg-white/8 hover:text-white ${collapsed ? "justify-center" : "gap-3 px-3"}`}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          <PanelLeftClose size={16} className={collapsed ? "rotate-180" : ""} />
          {collapsed ? null : <span className="text-[11px]">Collapse</span>}
        </button>
      </div>
    </aside>
  );
});

function Topbar({
  filters,
  onCommand,
  onFilters,
  onRefresh,
  onNotifications,
  onStates,
  onProfile,
}: {
  filters: Filters;
  onCommand: () => void;
  onFilters: () => void;
  onRefresh: () => void;
  onNotifications: () => void;
  onStates: () => void;
  onProfile: () => void;
}) {
  const activeFilters = [
    filters.date !== "Today · 03 Sep",
    filters.project !== "All projects",
    filters.site !== "All sites",
    filters.shift !== "All shifts",
    filters.status !== "All statuses",
  ].filter(Boolean).length;
  const siteScope =
    filters.site === "All sites" ? "All 6 sites" : siteName(filters.site);
  return (
    <header className="sticky top-0 z-30 flex min-h-[60px] items-center gap-2 border-b border-slate-200 bg-white/95 px-3 backdrop-blur lg:min-h-[66px] lg:gap-3 lg:px-5">
      <button
        onClick={onProfile}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy font-mono text-xs font-semibold text-white lg:hidden"
        aria-label="Open profile and settings"
      >
        H
      </button>
      <button
        onClick={onFilters}
        className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left lg:hidden"
        aria-label="Change operating scope"
      >
        <CalendarDays size={15} className="shrink-0 text-teal" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-navy">
            {filters.date}
          </span>
          <span className="block truncate text-[10px] text-slate-500">
            {siteScope}
          </span>
        </span>
        {activeFilters ? (
          <span className="rounded-full bg-teal/10 px-1.5 py-0.5 font-mono text-[10px] text-teal">
            {activeFilters}
          </span>
        ) : (
          <ChevronDown size={14} className="shrink-0 text-slate-400" />
        )}
      </button>
      <button
        onClick={onCommand}
        className="group hidden h-9 w-full max-w-[300px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-left transition hover:border-slate-300 hover:bg-white lg:flex xl:max-w-[340px]"
        aria-label="Search and navigate"
      >
        <Search size={15} className="shrink-0 text-slate-400" />
        <span className="flex-1 text-xs text-slate-500">
          Search anything or jump to…
        </span>
        <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-400">
          ⌘ K
        </span>
      </button>
      <div className="hidden h-7 w-px bg-slate-200 lg:block" />
      <div className="hidden min-w-0 flex-1 items-center gap-2 lg:flex">
        <span className="eyebrow hidden xl:inline">Current scope</span>
        <button
          onClick={onFilters}
          className="btn-ghost min-w-0 !justify-start"
        >
          <CalendarDays size={13} />
          <span className="truncate">{filters.date}</span>
          <span className="text-slate-300">·</span>
          <span className="max-w-[140px] truncate xl:max-w-[220px]">
            {siteScope}
          </span>
          {activeFilters ? (
            <span className="rounded-full bg-teal/10 px-1.5 py-0.5 font-mono text-[9px] text-teal">
              {activeFilters}
            </span>
          ) : null}
          <ChevronDown size={12} />
        </button>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <button onClick={onFilters} className="btn-secondary hidden lg:hidden">
          <SlidersHorizontal size={14} />
          {activeFilters ? activeFilters : "Scope"}
        </button>
        <button
          onClick={onStates}
          title="Data freshness and system status"
          className="hidden h-9 items-center gap-2 rounded-md px-2 text-[10px] font-medium text-slate-500 xl:flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green" />
          Current · 7m
        </button>
        <button
          onClick={onCommand}
          className="btn-secondary !h-10 !w-10 !p-0 lg:hidden"
          aria-label="Search and navigate"
        >
          <Search size={17} />
        </button>
        <button
          onClick={onRefresh}
          title="Refresh local prototype data"
          className="btn-secondary hidden !h-9 !w-9 !p-0 lg:inline-flex"
          aria-label="Refresh data"
        >
          <RefreshCw size={15} />
        </button>
        <button
          onClick={onNotifications}
          className="btn-secondary relative !h-10 !w-10 !p-0 lg:!h-9 lg:!w-9"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-critical lg:right-1.5 lg:top-1.5" />
        </button>
        <button
          onClick={onProfile}
          className="ml-1 hidden h-9 w-9 place-items-center rounded-md bg-navy text-[11px] font-semibold text-white lg:grid"
          title="Profile & settings"
          aria-label="Open profile and settings"
        >
          AM
        </button>
      </div>
    </header>
  );
}

function LegacyHomePage({
  filteredSites,
  actions,
  dateScope,
  onSite,
  onAction,
  onPage,
  onReport,
}: {
  filteredSites: Site[];
  actions: ActionItem[];
  dateScope: string;
  onSite: (site: Site) => void;
  onAction: (action: ActionItem) => void;
  onPage: (page: Page) => void;
  onReport: () => void;
}) {
  const live = filteredSites.filter(
    (site) => site.status === "Live" || site.status === "At risk",
  );
  const dateFactor = dateScope.startsWith("Today")
    ? 0.14
    : dateScope === "Last 7 days"
      ? 0.46
      : 1;
  const accepted = Math.round(
    filteredSites.reduce((sum, site) => sum + site.accepted, 0) * dateFactor,
  );
  const activeCameras = filteredSites.reduce(
    (sum, site) => sum + site.activeCameras,
    0,
  );
  const present = filteredSites.reduce((sum, site) => sum + site.present, 0);
  const avgAcceptance = filteredSites
    .filter((site) => site.acceptance > 0)
    .reduce((sum, site, _, array) => sum + site.acceptance / array.length, 0);
  const visibleActions = actions.filter(
    (action) =>
      filteredSites.some((site) => site.id === action.siteId) &&
      action.state !== "Resolved",
  );
  if (!filteredSites.length)
    return (
      <>
        <PageHeader
          eyebrow="Network command"
          title="Good afternoon, Aarav"
          description="No sites match the current operating scope."
        />
        <div className="surface">
          <EmptyState icon={Filter} />
        </div>
      </>
    );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Network command"
        title="Good afternoon, Aarav"
        description="Here is what needs attention across Sarthak Workforce Solutions · as of 15:12 IST."
      >
        <button className="btn-secondary" onClick={onReport}>
          <Download size={14} />
          Export briefing
        </button>
        <button
          className="btn-primary"
          onClick={() => onPage("Live Operations")}
        >
          <RadioTower size={14} />
          Open live view
        </button>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard
          label="Sites live"
          value={`${live.length} / ${filteredSites.length}`}
          delta="+1 this week"
          detail="Approved and collecting today"
          icon={Factory}
          onClick={() => onPage("Sites")}
        />
        <MetricCard
          label="Active cameras"
          value={`${activeCameras}`}
          delta="92% planned"
          detail={`${filteredSites.reduce((sum, site) => sum + site.cameras, 0)} cameras assigned in scope`}
          icon={Camera}
          onClick={() => onPage("Hardware")}
        />
        <MetricCard
          label="People present"
          value={`${present}`}
          delta="88% rostered"
          detail="Across active shifts today"
          icon={UserCheck}
          tone="green"
          onClick={() => onPage("People")}
        />
        <MetricCard
          label="Accepted output"
          value={`${accepted}h`}
          delta="+8.4%"
          detail={`${dateScope} · validated by HL`}
          icon={BadgeCheck}
          tone="green"
          onClick={() => onPage("Production")}
        />
        <MetricCard
          label="Acceptance rate"
          value={`${avgAcceptance.toFixed(1)}%`}
          delta="+2.1 pts"
          detail="Accepted ÷ validated hours"
          icon={TrendingUp}
          tone={avgAcceptance < 85 ? "amber" : "green"}
          onClick={() => onPage("Quality")}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.12fr_.88fr]">
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Needs your attention"
            meta={`${visibleActions.length} open items · ordered by severity and age`}
            action={
              <button className="btn-ghost" onClick={() => onPage("Quality")}>
                View all <ChevronRight size={13} />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {visibleActions.slice(0, 5).map((action, index) => (
              <button
                key={action.id}
                onClick={() => onAction(action)}
                className="row-enter flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <span
                  className={`h-8 w-1 shrink-0 rounded-full ${action.severity === "Critical" ? "bg-critical" : action.severity === "High" ? "bg-red-400" : action.severity === "Medium" ? "bg-amber" : "bg-slate-300"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Severity value={action.severity} />
                    <span className="truncate text-xs font-semibold text-navy">
                      {action.title}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-slate-500">
                    {siteName(action.siteId)} · {action.type} · Owner:{" "}
                    {action.owner}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="font-mono text-[11px] font-medium text-slate-700">
                    {action.age}
                  </p>
                  <p className="mt-0.5 text-[9px] text-slate-400">open</p>
                </div>
                <ChevronRight size={14} className="text-slate-300" />
              </button>
            ))}
          </div>
        </section>

        <section className="surface overflow-hidden">
          <SectionHeader
            title="Site health & readiness"
            meta="Live status, staffing, cameras and upload lag"
            action={
              <button className="btn-ghost" onClick={() => onPage("Sites")}>
                All sites <ChevronRight size={13} />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {filteredSites.slice(0, 5).map((site) => (
              <button
                key={site.id}
                onClick={() => onSite(site)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-md font-mono text-[10px] font-medium ${site.status === "At risk" || site.status === "Paused" ? "bg-red-50 text-critical" : "bg-teal/10 text-teal"}`}
                >
                  {site.city.slice(0, 3).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-semibold text-navy">
                      {site.name}
                    </p>
                    <StatusPill>{site.status}</StatusPill>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {site.present} present · {site.activeCameras}/{site.cameras}{" "}
                    cameras · {site.uploadLag}h lag
                  </p>
                </div>
                <div className="w-16">
                  <div className="mb-1 flex justify-between text-[9px] text-slate-400">
                    <span>Ready</span>
                    <span>{site.readiness}%</span>
                  </div>
                  <Progress
                    value={site.readiness}
                    tone={site.readiness < 80 ? "amber" : "green"}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Production movement"
            meta="Recorded, uploaded and accepted hours · last 7 operating days"
            action={
              <button
                className="btn-ghost"
                onClick={() => onPage("Production")}
              >
                Drill down <ArrowUpRight size={13} />
              </button>
            }
          />
          <div className="h-[250px] px-2 pb-2 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ left: -20, right: 12, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#EDF1F3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#73818B" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#73818B" }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  contentStyle={{
                    border: "1px solid #dfe5e9",
                    borderRadius: 6,
                    boxShadow: "none",
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="recorded"
                  stroke="#9AA8B1"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="uploaded"
                  stroke="#31696D"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke="#5A9F68"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: "#5A9F68" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 bg-slate-400" />
              Recorded
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 bg-teal" />
              Uploaded
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 bg-green" />
              Accepted
            </span>
            <span className="ml-auto font-mono">
              Source: Collection + Validation · 15:05 IST
            </span>
          </div>
        </section>
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Upcoming milestones"
            meta="Next 7 days · IST"
            action={<CalendarDays size={15} className="text-slate-400" />}
          />
          <div className="divide-y divide-slate-100">
            {milestones
              .filter((m) => filteredSites.some((s) => s.id === m.siteId))
              .map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50"
                >
                  <span className="w-12 shrink-0 font-mono text-[10px] font-medium text-teal">
                    {item.date}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-navy">
                      {item.label}
                    </span>
                    <span className="mt-1 block truncate text-[10px] text-slate-500">
                      {item.type} · {item.owner}
                    </span>
                  </span>
                  <ChevronRight size={13} className="mt-1 text-slate-300" />
                </button>
              ))}
          </div>
        </section>
      </div>

      <section className="surface mt-4 overflow-hidden">
        <SectionHeader
          title="Planning & intelligence"
          meta="Explainable signals only · assumptions remain visible"
          action={
            <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              Preview
            </span>
          }
        />
        <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          <button
            onClick={() => onPage("Production")}
            className="p-4 text-left hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit size={15} className="text-teal" />
              <span className="eyebrow">Forecast</span>
            </div>
            <p className="mt-3 font-mono text-lg font-medium text-navy">
              1,284–1,396h
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Projected accepted output for September at 88% confidence.
            </p>
          </button>
          <button
            onClick={() => onSite(sites[1])}
            className="p-4 text-left hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber" />
              <span className="eyebrow">Risk signal</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-navy">
              Shakti may miss weekly target
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Driven by 25% camera downtime, one absent operator and 14.2h
              upload lag.
            </p>
          </button>
          <button
            onClick={() => onAction(initialActions[1])}
            className="p-4 text-left hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <Lightbulb size={15} className="text-green" />
              <span className="eyebrow">Recommended action</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-navy">
              Move 8 cameras to Shift A
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Could recover 11–14 accepted hours this week. Accept, assign or
              dismiss.
            </p>
          </button>
          <button
            onClick={() => onPage("Quality")}
            className="p-4 text-left hover:bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <ClipboardCheck size={15} className="text-teal" />
              <span className="eyebrow">Partner scorecard</span>
            </div>
            <p className="mt-3 font-mono text-lg font-medium text-navy">
              83% on target
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Go-live, yield, recovery, issue SLA and disputes. No cross-partner
              ranking.
            </p>
          </button>
        </div>
      </section>
    </div>
  );
}

function PreviousHomePage({
  filteredSites,
  actions,
  dateScope,
  onSite,
  onAction,
  onPage,
  onReport,
}: {
  filteredSites: Site[];
  actions: ActionItem[];
  dateScope: string;
  onSite: (site: Site) => void;
  onAction: (action: ActionItem) => void;
  onPage: (page: Page) => void;
  onReport: () => void;
}) {
  const [view, setView] = useState<"Overview" | "Performance" | "Plan ahead">(
    "Overview",
  );
  const [lens, setLens] = useState<
    "all" | "attention" | "collecting" | "preparing"
  >("all");
  const attentionSiteIds = new Set(
    filteredSites
      .filter((site) => ["At risk", "Paused", "Review"].includes(site.status))
      .map((site) => site.id),
  );
  const quickViews: {
    id: typeof lens;
    label: string;
    count: number;
    detail: string;
    destination: Page;
  }[] = [
    {
      id: "all",
      label: "All network",
      count: filteredSites.length,
      detail: "Every site in the current operating scope",
      destination: "Sites",
    },
    {
      id: "attention",
      label: "Needs attention",
      count: attentionSiteIds.size,
      detail: "Sites with a live exception, pause or pending review",
      destination: "Live Operations",
    },
    {
      id: "collecting",
      label: "Collecting now",
      count: filteredSites.filter(
        (site) => site.status === "Live" || site.status === "At risk",
      ).length,
      detail: "Sites actively collecting in the current period",
      destination: "Live Operations",
    },
    {
      id: "preparing",
      label: "Preparing",
      count: filteredSites.filter(
        (site) => site.status === "Ready" || site.status === "Review",
      ).length,
      detail: "Sites moving through readiness or Humyn Labs review",
      destination: "Sites",
    },
  ];
  const activeQuickView = quickViews.find((item) => item.id === lens)!;
  const lensSites =
    lens === "attention"
      ? filteredSites.filter((site) => attentionSiteIds.has(site.id))
      : lens === "collecting"
        ? filteredSites.filter(
            (site) => site.status === "Live" || site.status === "At risk",
          )
        : lens === "preparing"
          ? filteredSites.filter(
              (site) => site.status === "Ready" || site.status === "Review",
            )
          : filteredSites;
  const operatingSites = lensSites.filter(
    (site) => site.status === "Live" || site.status === "At risk",
  );
  const constrainedSites = lensSites.filter((site) =>
    ["At risk", "Paused", "Review"].includes(site.status),
  );
  const visibleActions = actions.filter(
    (action) =>
      lensSites.some((site) => site.id === action.siteId) &&
      action.state !== "Resolved",
  );
  const priorityActions = visibleActions.filter(
    (action) => action.severity === "Critical" || action.severity === "High",
  );
  const dateFactor = dateScope.startsWith("Today")
    ? 0.14
    : dateScope === "Last 7 days"
      ? 0.46
      : 1;
  const accepted = Math.round(
    lensSites.reduce((sum, site) => sum + site.accepted, 0) * dateFactor,
  );
  const activeCameras = lensSites.reduce(
    (sum, site) => sum + site.activeCameras,
    0,
  );
  const assignedCameras = lensSites.reduce(
    (sum, site) => sum + site.cameras,
    0,
  );
  const present = lensSites.reduce((sum, site) => sum + site.present, 0);
  const acceptanceValues = lensSites.filter((site) => site.acceptance > 0);
  const averageAcceptance = acceptanceValues.length
    ? acceptanceValues.reduce((sum, site) => sum + site.acceptance, 0) /
      acceptanceValues.length
    : 0;
  const sortedSites = [...lensSites].sort(
    (a, b) =>
      Number(["At risk", "Paused", "Review"].includes(b.status)) -
      Number(["At risk", "Paused", "Review"].includes(a.status)),
  );
  const periodTitle = dateScope.startsWith("Today") ? "Today" : dateScope;
  const siteWord = operatingSites.length === 1 ? "site is" : "sites are";
  const priorityWord =
    priorityActions.length === 1 ? "priority needs" : "priorities need";

  useEffect(() => setLens("all"), [filteredSites]);

  if (!filteredSites.length)
    return (
      <>
        <PageHeader
          eyebrow="Partner overview"
          title="No sites in this scope"
          description="Change the operating scope to bring sites back into view."
        />
        <div className="surface">
          <EmptyState icon={Filter} />
        </div>
      </>
    );

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Partner overview"
        title={`${periodTitle}, across your network`}
        description={`${operatingSites.length} ${siteWord} collecting · ${priorityActions.length} ${priorityWord} attention before the next shift.`}
      >
        <button className="btn-secondary" onClick={onReport}>
          <Download size={14} />
          Export briefing
        </button>
        <button
          className="btn-primary"
          onClick={() => onPage("Live Operations")}
        >
          <RadioTower size={14} />
          Open live operations
        </button>
      </PageHeader>

      <div className="mb-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-5" role="tablist" aria-label="Home views">
          {(["Overview", "Performance", "Plan ahead"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={view === tab}
              onClick={() => {
                setView(tab);
                if (tab !== "Overview") setLens("all");
              }}
              className={`border-b-2 pb-2.5 text-xs font-semibold transition ${view === tab ? "border-teal text-teal" : "border-transparent text-slate-500 hover:text-navy"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <p className="pb-2.5 text-[10px] text-slate-400">
          Updated 7 minutes ago
        </p>
      </div>

      {view === "Overview" ? (
        <>
          <section
            className="surface mb-4 overflow-hidden"
            aria-label="Filter overview by operating state"
          >
            <div className="flex flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="mr-1 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-teal/10 text-teal">
                  <SlidersHorizontal size={15} />
                </span>
                <span>
                  <span className="block text-xs font-semibold text-navy">
                    Quick views
                  </span>
                  <span className="block text-[9px] text-slate-500">
                    Filter this overview
                  </span>
                </span>
              </div>
              <div
                className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
                role="group"
                aria-label="Network quick views"
              >
                {quickViews.map((item) => (
                  <button
                    key={item.id}
                    aria-pressed={lens === item.id}
                    disabled={!item.count}
                    onClick={() => setLens(item.id)}
                    className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${lens === item.id ? "border-teal bg-teal text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`min-w-5 rounded px-1.5 py-0.5 text-center font-mono text-[9px] ${lens === item.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}
                    >
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 border-t border-slate-200 pt-3 sm:ml-auto sm:min-w-[280px] sm:justify-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                <p className="min-w-0 max-w-[270px] text-left text-[10px] leading-4 text-slate-500 sm:text-right">
                  <span className="font-semibold text-navy">
                    {activeQuickView.label}:
                  </span>{" "}
                  {activeQuickView.detail}
                </p>
                <button
                  className="btn-ghost shrink-0"
                  onClick={() => onPage(activeQuickView.destination)}
                >
                  Open {activeQuickView.destination}
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </section>

          <section className="surface overflow-hidden border-l-4 border-l-teal">
            <div className="flex flex-col items-stretch gap-4 px-4 py-4 sm:flex-row sm:items-center sm:gap-5 sm:px-5">
              <span
                className={`hidden h-10 w-10 shrink-0 place-items-center rounded-full sm:grid ${priorityActions.length ? "bg-amber-50 text-amber" : "bg-green/10 text-green"}`}
              >
                {priorityActions.length ? (
                  <AlertTriangle size={19} />
                ) : (
                  <CheckCircle2 size={19} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow">Operational brief</p>
                <p className="mt-1 text-sm font-semibold text-navy">
                  {priorityActions.length
                    ? `${priorityActions.length} decisions can protect today’s output`
                    : "No urgent intervention is needed"}
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  {priorityActions.length
                    ? `${constrainedSites.length} sites are constrained by uploads, staffing or quality. Start with ${siteName(priorityActions[0].siteId)}.`
                    : "Collection, uploads and quality are operating within their expected ranges."}
                </p>
              </div>
              {priorityActions[0] ? (
                <button
                  className="btn-primary w-full shrink-0 sm:w-auto"
                  onClick={() => onAction(priorityActions[0])}
                >
                  Review highest priority <ChevronRight size={13} />
                </button>
              ) : null}
            </div>
          </section>

          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard
              label="Sites collecting"
              value={`${operatingSites.length} / ${lensSites.length}`}
              detail={`${constrainedSites.length} constrained · ${lensSites.filter((site) => site.status === "Ready" || site.status === "Review").length} preparing`}
              icon={Factory}
              tone={constrainedSites.length ? "amber" : "green"}
              onClick={() => onPage("Sites")}
            />
            <MetricCard
              label="Cameras recording"
              value={`${activeCameras} / ${assignedCameras}`}
              detail="Active cameras against assigned network capacity"
              icon={Camera}
              tone={
                activeCameras / Math.max(1, assignedCameras) < 0.8
                  ? "amber"
                  : "teal"
              }
              onClick={() => onPage("Hardware")}
            />
            <MetricCard
              label="People present"
              value={`${present}`}
              detail="Across active shifts in the current scope"
              icon={UserCheck}
              tone="green"
              onClick={() => onPage("People")}
            />
            <MetricCard
              label={
                dateScope.startsWith("Today")
                  ? "Accepted today"
                  : "Accepted output"
              }
              value={`${accepted}h`}
              delta="+8.4%"
              detail={`${dateScope} · Humyn Labs validated`}
              icon={BadgeCheck}
              tone="green"
              onClick={() => onPage("Production")}
            />
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.18fr_.82fr]">
            <section className="surface overflow-hidden">
              <SectionHeader
                title="Priorities"
                meta="Ordered by impact · open an item to see context and the next step"
                action={
                  <button
                    className="btn-ghost"
                    onClick={() => onPage("Live Operations")}
                  >
                    Open action workspace <ChevronRight size={13} />
                  </button>
                }
              />
              <div className="divide-y divide-slate-100">
                {visibleActions.slice(0, 4).map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => onAction(action)}
                    className="row-enter grid w-full grid-cols-[28px_1fr_auto_16px] items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    style={{ animationDelay: `${index * 35}ms` }}
                  >
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-medium ${action.severity === "Critical" ? "bg-red-50 text-critical" : action.severity === "High" ? "bg-amber-50 text-amber" : "bg-slate-100 text-slate-500"}`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-navy">
                          {action.title}
                        </span>
                        <Severity value={action.severity} />
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        {siteName(action.siteId)} · {action.owner} · due{" "}
                        {action.due}
                      </span>
                    </span>
                    <span className="hidden text-right sm:block">
                      <span className="block text-[10px] font-medium text-slate-600">
                        {action.type}
                      </span>
                      <span className="mt-1 block font-mono text-[9px] text-slate-400">
                        open {action.age}
                      </span>
                    </span>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
              {visibleActions.length > 4 ? (
                <button
                  onClick={() => onPage("Live Operations")}
                  className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[11px] font-medium text-teal hover:bg-slate-50"
                >
                  Show {visibleActions.length - 4} more open items{" "}
                  <ChevronRight size={12} />
                </button>
              ) : null}
            </section>

            <section className="surface overflow-hidden">
              <SectionHeader
                title="Network health"
                meta="Exceptions first · select a site for its full operating record"
                action={
                  <button className="btn-ghost" onClick={() => onPage("Sites")}>
                    All sites <ChevronRight size={13} />
                  </button>
                }
              />
              <div className="divide-y divide-slate-100">
                {sortedSites.slice(0, 4).map((site) => (
                  <button
                    key={site.id}
                    onClick={() => onSite(site)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${site.status === "At risk" || site.status === "Paused" ? "bg-critical" : site.status === "Review" || site.status === "Ready" ? "bg-amber" : "bg-green"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-semibold text-navy">
                          {site.name}
                        </span>
                        <StatusPill>{site.status}</StatusPill>
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        {site.nextAction}
                      </span>
                    </span>
                    <span className="w-20 shrink-0">
                      <span className="mb-1 flex justify-between font-mono text-[9px] text-slate-400">
                        <span>Ready</span>
                        <span>{site.readiness}%</span>
                      </span>
                      <Progress
                        value={site.readiness}
                        tone={site.readiness < 80 ? "amber" : "green"}
                      />
                    </span>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}

      {view === "Performance" ? (
        <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
          <section className="surface overflow-hidden">
            <SectionHeader
              title="Output movement"
              meta="Recorded, uploaded and accepted hours · last 7 operating days"
              action={
                <button
                  className="btn-ghost"
                  onClick={() => onPage("Production")}
                >
                  Open production <ArrowUpRight size={13} />
                </button>
              }
            />
            <div className="h-[300px] px-2 pb-2 pt-5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ left: -20, right: 12, top: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke="#EDF1F3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "#73818B" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#73818B" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    contentStyle={{
                      border: "1px solid #dfe5e9",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="recorded"
                    stroke="#94A3AD"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="uploaded"
                    stroke="#31696D"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="accepted"
                    stroke="#5A9F68"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: "#5A9F68" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-5 border-t border-slate-100 px-4 py-2.5 text-[9px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <i className="h-0.5 w-4 bg-slate-400" />
                Recorded
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-0.5 w-4 bg-teal" />
                Uploaded
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-0.5 w-4 bg-green" />
                Accepted
              </span>
              <span className="ml-auto font-mono">
                Collection + Validation · 15:05 IST
              </span>
            </div>
          </section>
          <section className="surface overflow-hidden">
            <SectionHeader
              title="Performance summary"
              meta="The three signals that explain this week"
            />
            <div className="divide-y divide-slate-100">
              <button
                onClick={() => onPage("Quality")}
                className="w-full p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <span className="eyebrow">Quality conversion</span>
                  <span className="font-mono text-lg font-medium text-navy">
                    {averageAcceptance.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                  Acceptance is improving, but Shakti’s welding footage remains
                  the largest recoverable loss.
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-teal">
                  Open Quality <ChevronRight size={11} />
                </span>
              </button>
              <button
                onClick={() => onPage("Production")}
                className="w-full p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <span className="eyebrow">Weekly trajectory</span>
                  <span className="font-mono text-lg font-medium text-green">
                    +8.4%
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                  Accepted hours are ahead of last week; today’s upload gap may
                  soften the close.
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-teal">
                  Inspect records <ChevronRight size={11} />
                </span>
              </button>
              <button
                onClick={() => onPage("Payments")}
                className="w-full p-4 text-left hover:bg-slate-50"
              >
                <div className="flex items-start justify-between">
                  <span className="eyebrow">Expected payable</span>
                  <span className="font-mono text-lg font-medium text-navy">
                    ₹2.81L
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                  Two August invoices are open; one needs clarification before
                  release.
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-teal">
                  Open Payments <ChevronRight size={11} />
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {view === "Plan ahead" ? (
        <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
          <section className="surface overflow-hidden">
            <SectionHeader
              title="Upcoming milestones"
              meta="The next 7 days · dates shown in IST"
              action={<CalendarDays size={15} className="text-slate-400" />}
            />
            <div className="divide-y divide-slate-100">
              {milestones
                .filter((item) =>
                  filteredSites.some((site) => site.id === item.siteId),
                )
                .map((item) => (
                  <button
                    key={item.label}
                    onClick={() =>
                      onSite(sites.find((site) => site.id === item.siteId)!)
                    }
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
                  >
                    <span className="w-12 shrink-0 font-mono text-[10px] font-medium text-teal">
                      {item.date}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-navy">
                        {item.label}
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        {item.type} · {item.owner}
                      </span>
                    </span>
                    <ChevronRight size={13} className="mt-1 text-slate-300" />
                  </button>
                ))}
            </div>
          </section>
          <section className="surface overflow-hidden">
            <SectionHeader
              title="Planning signals"
              meta="Explainable suggestions · assumptions stay visible"
              action={
                <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                  Preview
                </span>
              }
            />
            <div className="grid grid-cols-2 divide-x divide-y divide-slate-100">
              <button
                onClick={() => onPage("Production")}
                className="p-5 text-left hover:bg-slate-50"
              >
                <BrainCircuit size={17} className="text-teal" />
                <p className="mt-3 eyebrow">September forecast</p>
                <p className="mt-2 font-mono text-lg font-medium text-navy">
                  1,284–1,396h
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Projected accepted output at 88% confidence.
                </p>
              </button>
              <button
                onClick={() => onSite(sites[1])}
                className="p-5 text-left hover:bg-slate-50"
              >
                <AlertTriangle size={17} className="text-amber" />
                <p className="mt-3 eyebrow">Primary risk</p>
                <p className="mt-2 text-sm font-semibold text-navy">
                  Shakti may miss target
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Driven by camera downtime, staffing and upload lag.
                </p>
              </button>
              <button
                onClick={() => onAction(initialActions[1])}
                className="p-5 text-left hover:bg-slate-50"
              >
                <Lightbulb size={17} className="text-green" />
                <p className="mt-3 eyebrow">Recommended action</p>
                <p className="mt-2 text-sm font-semibold text-navy">
                  Move 8 cameras to Shift A
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Could recover 11–14 accepted hours this week.
                </p>
              </button>
              <button
                onClick={() => onPage("Quality")}
                className="p-5 text-left hover:bg-slate-50"
              >
                <ClipboardCheck size={17} className="text-teal" />
                <p className="mt-3 eyebrow">Partner scorecard</p>
                <p className="mt-2 font-mono text-lg font-medium text-navy">
                  83% on target
                </p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  Go-live, yield, recovery, issue SLA and disputes.
                </p>
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function HomePage({
  filteredSites,
  actions,
  dateScope,
  onSite,
  onAction,
  onPage,
  onReport,
}: {
  filteredSites: Site[];
  actions: ActionItem[];
  dateScope: string;
  onSite: (site: Site) => void;
  onAction: (action: ActionItem) => void;
  onPage: (page: Page) => void;
  onReport: () => void;
}) {
  const operatingSites = filteredSites.filter(
    (site) => site.status === "Live" || site.status === "At risk",
  );
  const acceptanceSites = filteredSites.filter((site) => site.acceptance > 0);
  const averageAcceptance = acceptanceSites.length
    ? acceptanceSites.reduce((sum, site) => sum + site.acceptance, 0) /
      acceptanceSites.length
    : 0;
  const dateFactor = dateScope.startsWith("Today")
    ? 0.14
    : dateScope === "Last 7 days"
      ? 0.46
      : 1;
  const accepted = Math.round(
    filteredSites.reduce((sum, site) => sum + site.accepted, 0) * dateFactor,
  );
  const scopedInvoices = invoiceData.filter((invoice) =>
    filteredSites.some((site) => site.id === invoice.siteId),
  );
  const payable = scopedInvoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const priorityActions = actions.filter(
    (action) =>
      filteredSites.some((site) => site.id === action.siteId) &&
      action.state !== "Resolved" &&
      (action.severity === "Critical" || action.severity === "High"),
  );
  const validationRecords = production.filter((record) =>
    filteredSites.some((site) => site.id === record.siteId),
  );
  const validationTotals = validationRecords.reduce(
    (total, record) => ({
      recorded: total.recorded + record.raw,
      uploaded: total.uploaded + record.uploaded,
      accepted: total.accepted + record.accepted,
    }),
    { recorded: 0, uploaded: 0, accepted: 0 },
  );
  const reviewSites = filteredSites.filter((site) => site.status === "Review");
  const readySites = filteredSites.filter((site) => site.status === "Ready");
  const approvedSites = filteredSites.filter(
    (site) =>
      site.status === "Live" ||
      site.status === "At risk" ||
      site.status === "Paused",
  );
  const hardwareRows = filteredSites.map((site) => {
    const cameras = site.cameras;
    const sdCards = site.cameras + 4;
    const phones = Math.max(1, Math.ceil(site.cameras / 24));
    const kits = Math.max(1, Math.ceil(site.cameras / 20));
    return {
      site,
      cameras,
      sdCards,
      phones,
      kits,
      units: cameras + sdCards + phones + kits,
      value: cameras * 68000 + sdCards * 6200 + phones * 24000 + kits * 18500,
    };
  });
  const hardwareTotals = hardwareRows.reduce(
    (total, row) => ({
      units: total.units + row.units,
      value: total.value + row.value,
    }),
    { units: 0, value: 0 },
  );
  const onboardingStages = [
    {
      label: "In HL review",
      sites: reviewSites,
      icon: FileCheck2,
      tone: "bg-amber/10 text-amber",
    },
    {
      label: "Preparing to launch",
      sites: readySites,
      icon: ClipboardCheck,
      tone: "bg-teal/10 text-teal",
    },
    {
      label: "Approved network",
      sites: approvedSites,
      icon: RadioTower,
      tone: "bg-green/10 text-green",
    },
  ];
  if (!filteredSites.length)
    return (
      <>
        <PageHeader
          eyebrow="HL workspace"
          title="Partner performance"
          description="No sites match the current operating scope."
        />
        <div className="surface">
          <EmptyState icon={Filter} />
        </div>
      </>
    );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="HL workspace"
        title="Partner performance"
        description={`Macro view of your network, output, quality and commercial position · ${dateScope}.`}
      >
        <button className="btn-secondary" onClick={onReport}>
          <Download size={14} />
          Export overview
        </button>
        <button className="btn-primary" onClick={() => onPage("Sites")}>
          <MapPinned size={14} />
          View your sites
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Sites in network"
          value={`${filteredSites.length}`}
          detail={`${operatingSites.length} collecting · ${filteredSites.length - operatingSites.length} onboarding or paused`}
          icon={Factory}
          onClick={() => onPage("Sites")}
        />
        <MetricCard
          label="Hardware assigned"
          value={`${hardwareTotals.units}`}
          detail={`${money.format(hardwareTotals.value)} total value`}
          icon={Boxes}
          onClick={() => onPage("Hardware")}
        />
        <MetricCard
          label="Accepted output"
          value={`${accepted}h`}
          delta="+8.4%"
          detail={`${dateScope} · Humyn Labs validated`}
          icon={BadgeCheck}
          tone="green"
          onClick={() => onPage("Production")}
        />
        <MetricCard
          label="Expected payable"
          value={money.format(payable)}
          detail={`${scopedInvoices.filter((invoice) => invoice.status !== "Paid").length} open invoices in the current network`}
          icon={CircleDollarSign}
          onClick={() => onPage("Payments")}
        />
      </div>

      <section className="surface mt-4 overflow-hidden">
        <SectionHeader
          title="HL validation"
          action={
            <button className="btn-ghost" onClick={() => onPage("Production")}>
              View output records <ChevronRight size={13} />
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-3">
          <div className="bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">1 · Recorded</span>
              <Video size={15} className="text-slate-400" />
            </div>
            <p className="mt-3 font-mono text-2xl font-medium text-navy">
              {validationTotals.recorded.toFixed(1)}h
            </p>
          </div>
          <div className="bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">2 · Uploaded to HL</span>
              <UploadCloud size={15} className="text-teal" />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-mono text-2xl font-medium text-navy">
                {validationTotals.uploaded.toFixed(1)}h
              </p>
              <span className="font-mono text-xs font-medium text-teal">
                {(
                  (validationTotals.uploaded /
                    Math.max(1, validationTotals.recorded)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
          <div className="bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="eyebrow">3 · Accepted by HL</span>
              <BadgeCheck size={15} className="text-green" />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-mono text-2xl font-medium text-navy">
                {validationTotals.accepted.toFixed(1)}h
              </p>
              <span className="font-mono text-xs font-medium text-green">
                {(
                  (validationTotals.accepted /
                    Math.max(1, validationTotals.uploaded)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Network output"
            meta="Latest 7 operating days · recorded, uploaded and accepted hours"
            action={
              <span className="rounded-md bg-green/10 px-2 py-1 font-mono text-[10px] font-medium text-green">
                {averageAcceptance.toFixed(1)}% acceptance
              </span>
            }
          />
          <div className="h-[285px] px-2 pb-2 pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ left: -20, right: 12, top: 8, bottom: 0 }}
              >
                <CartesianGrid stroke="#EDF1F3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: "#73818B" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#73818B" }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  contentStyle={{
                    border: "1px solid #dfe5e9",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="recorded"
                  stroke="#94A3AD"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="uploaded"
                  stroke="#31696D"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="accepted"
                  stroke="#5A9F68"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: "#5A9F68" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 px-4 py-2.5 text-[9px] text-slate-500 sm:gap-5">
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 bg-slate-400" />
              Recorded
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 bg-teal" />
              Uploaded
            </span>
            <span className="flex items-center gap-1.5">
              <i className="h-0.5 w-4 bg-green" />
              Accepted
            </span>
            <button
              className="w-full text-left font-semibold text-teal sm:ml-auto sm:w-auto sm:text-right"
              onClick={() => onPage("Production")}
            >
              Open Production <ChevronRight size={11} className="inline" />
            </button>
          </div>
        </section>

        <section className="surface overflow-hidden">
          <SectionHeader
            title="Hardware assigned by Humyn Labs"
            action={
              <button className="btn-ghost" onClick={() => onPage("Hardware")}>
                {hardwareTotals.units} units ·{" "}
                {money.format(hardwareTotals.value)} <ChevronRight size={13} />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {hardwareRows.map((row) => (
              <button
                key={row.site.id}
                onClick={() => onSite(row.site)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-teal/10 text-teal">
                  <Camera size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-navy">
                    {row.site.name}
                  </span>
                  <span className="mt-0.5 block text-[9px] text-slate-500">
                    {row.cameras} cameras · {row.sdCards} SD cards ·{" "}
                    {row.phones} phones · {row.kits} kits
                  </span>
                </span>
                <span className="font-mono text-[11px] font-medium text-navy">
                  {money.format(row.value)}
                </span>
                <ChevronRight size={13} className="text-slate-300" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[.72fr_1.28fr]">
        <section className="surface overflow-hidden">
          <SectionHeader
            title="HL decisions & payments"
            meta="What is currently with Humyn Labs"
          />
          <div className="divide-y divide-slate-100">
            <button
              onClick={() => onPage("Quality")}
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-amber/10 text-amber">
                <BadgeCheck size={15} />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-semibold text-navy">
                  Quality decisions
                </span>
                <span className="mt-1 block text-[10px] text-slate-500">
                  4 samples are in correction or HL recheck
                </span>
              </span>
              <ChevronRight size={13} className="text-slate-300" />
            </button>
            <button
              onClick={() => onPage("Payments")}
              className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50"
            >
              <span className="grid h-8 w-8 place-items-center rounded-md bg-green/10 text-green">
                <Banknote size={15} />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-semibold text-navy">
                  Payments
                </span>
                <span className="mt-1 block text-[10px] text-slate-500">
                  {money.format(payable)} expected across open invoices
                </span>
              </span>
              <ChevronRight size={13} className="text-slate-300" />
            </button>
          </div>
        </section>
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Network priorities"
            meta={`${priorityActions.length} high-impact items across the partner network`}
            action={
              <button
                className="btn-ghost"
                onClick={() => onPage("Live Operations")}
              >
                Open operations <ChevronRight size={13} />
              </button>
            }
          />
          <div className="divide-y divide-slate-100">
            {priorityActions.slice(0, 3).map((action, index) => (
              <button
                key={action.id}
                onClick={() => onAction(action)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 font-mono text-[10px] text-slate-500">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-xs font-semibold text-navy">
                      {action.title}
                    </span>
                    <Severity value={action.severity} />
                  </span>
                  <span className="mt-1 block truncate text-[10px] text-slate-500">
                    {siteName(action.siteId)} · {action.owner} · due{" "}
                    {action.due}
                  </span>
                </span>
                <ChevronRight size={13} className="text-slate-300" />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="surface mt-4 overflow-hidden">
        <SectionHeader
          title="Site onboarding"
          action={
            <button className="btn-ghost" onClick={() => onPage("Sites")}>
              Open site records <ChevronRight size={13} />
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-3">
          {onboardingStages.map((stage, index) => {
            const StageIcon = stage.icon;
            return (
              <div key={stage.label} className="bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-md ${stage.tone}`}
                    >
                      <StageIcon size={16} />
                    </span>
                    <div>
                      <span className="eyebrow">Stage {index + 1}</span>
                      <h2 className="mt-1 text-sm font-semibold text-navy">
                        {stage.label}
                      </h2>
                    </div>
                  </div>
                  <span className="font-mono text-2xl font-medium text-navy">
                    {stage.sites.length}
                  </span>
                </div>
                <div className="mt-3 space-y-1.5">
                  {stage.sites.length ? (
                    stage.sites.map((site) => (
                      <button
                        key={site.id}
                        onClick={() => onSite(site)}
                        className="flex w-full items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-left transition hover:bg-[#EDF5F5]"
                      >
                        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-navy">
                          {site.name}
                        </span>
                        <StatusPill>{site.status}</StatusPill>
                        <ChevronRight size={12} className="text-slate-300" />
                      </button>
                    ))
                  ) : (
                    <p className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-[10px] text-slate-400">
                      No sites
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SitesPage({
  filteredSites,
  onSite,
  showToast,
}: {
  filteredSites: Site[];
  onSite: (site: Site) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"attention" | "readiness" | "name">(
    "attention",
  );
  const q = useDeferredValue(search.toLowerCase());
  const statusRank: Record<Site["status"], number> = {
    "At risk": 0,
    Paused: 1,
    Review: 2,
    Ready: 3,
    Live: 4,
  };
  const visible = useMemo(
    () =>
      filteredSites
        .filter((site) =>
          `${site.name} ${site.id} ${site.city} ${site.state} ${site.manager}`
            .toLowerCase()
            .includes(q),
        )
        .toSorted((a, b) =>
          sort === "readiness"
            ? a.readiness - b.readiness
            : sort === "name"
              ? a.name.localeCompare(b.name)
              : statusRank[a.status] - statusRank[b.status],
        ),
    [filteredSites, q, sort],
  );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Sites workspace"
        title="Your sites"
        description="Choose a factory to see its complete team, hardware, operations, readiness and Humyn Labs history."
      >
        <button
          className="btn-secondary"
          onClick={() =>
            showToast(
              "Form draft opened",
              "Site Identification fields would be prefilled with the partner identity in production.",
            )
          }
        >
          <FileSpreadsheet size={14} />
          New site draft
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            showToast(
              "Export prepared",
              `${visible.length} scoped site records were prepared with the current filters.`,
            )
          }
        >
          <Download size={14} />
          Export sites
        </button>
      </PageHeader>

      <section className="surface overflow-hidden">
        <SectionHeader
          title="Site portfolio"
          meta={`${visible.length} sites in this view · open a card for the complete site record`}
        />
        <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search site, city, manager or ID"
          />
          <div className="flex items-center gap-2">
            <span className="label">Show first</span>
            <select
              className="control"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="attention">Needs attention</option>
              <option value="readiness">Lowest readiness</option>
              <option value="name">Site name</option>
            </select>
          </div>
        </div>
        {visible.length ? (
          <div className="grid gap-px bg-slate-200 lg:grid-cols-2 2xl:grid-cols-3">
            {visible.map((site, index) => (
              <button
                key={site.id}
                onClick={() => onSite(site)}
                aria-label={`Open complete record for ${site.name}`}
                className="row-enter group bg-white p-4 text-left transition hover:bg-[#F4F8F8]"
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusPill>{site.status}</StatusPill>
                      <span className="font-mono text-[9px] text-slate-400">
                        {site.id}
                      </span>
                    </div>
                    <h2 className="mt-3 truncate text-sm font-semibold text-navy">
                      {site.name}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <MapPin size={11} />
                      {site.city}, {site.state} · {site.type}
                    </p>
                  </div>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-teal group-hover:bg-teal group-hover:text-white">
                    <ChevronRight size={14} />
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-3">
                  <div>
                    <span className="eyebrow">Workers</span>
                    <span className="mt-1 block font-mono text-sm font-medium text-navy">
                      {site.workers}
                    </span>
                  </div>
                  <div>
                    <span className="eyebrow">Operators</span>
                    <span
                      className={`mt-1 block font-mono text-sm font-medium ${site.operators < site.requiredOperators ? "text-critical" : "text-navy"}`}
                    >
                      {site.operators}/{site.requiredOperators}
                    </span>
                  </div>
                  <div>
                    <span className="eyebrow">Cameras</span>
                    <span className="mt-1 block font-mono text-sm font-medium text-navy">
                      {site.activeCameras}/{site.cameras}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Go-live readiness</span>
                    <span className="font-mono font-medium text-navy">
                      {site.readiness}%
                    </span>
                  </div>
                  <Progress
                    value={site.readiness}
                    tone={site.readiness < 75 ? "amber" : "green"}
                  />
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${site.nextAction === "No urgent action" ? "bg-green" : "bg-amber"}`}
                  />
                  <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-slate-600">
                    {site.nextAction}
                  </span>
                  <span className="text-[10px] font-semibold text-teal">
                    Open site
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sites found"
            detail="Try a site name, city, manager or Site ID."
          />
        )}
      </section>
    </div>
  );
}

function PeoplePage({
  filteredSites,
  onPerson,
  showToast,
}: {
  filteredSites: Site[];
  onPerson: (person: Person) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<
    "All people" | "Operator" | "Supervisor" | "Worker"
  >("All people");
  const q = useDeferredValue(search.toLowerCase());
  const scopedPeople = people.filter((person) =>
    filteredSites.some((site) => site.id === person.siteId),
  );
  const visible = scopedPeople.filter(
    (person) =>
      (role === "All people" || displayRole(person) === role) &&
      `${person.name} ${person.id} ${person.job} ${person.skill} ${siteName(person.siteId)}`
        .toLowerCase()
        .includes(q),
  );
  const roleCards = [
    { key: "Operator" as const, label: "Operators", icon: Camera },
    { key: "Supervisor" as const, label: "Supervisors", icon: UserRoundCog },
    { key: "Worker" as const, label: "Workers", icon: UsersRound },
  ];
  return (
    <div className="page-enter">
      <PageHeader eyebrow="Sites · People" title="People" description="">
        <button
          className="btn-secondary"
          onClick={() =>
            showToast(
              "Roster exported",
              `${visible.length} partner-owned profiles exported.`,
            )
          }
        >
          <Download size={14} />
          Export roster
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            showToast(
              "Add person opened",
              "Choose operator, supervisor or worker, then assign a site and shift.",
            )
          }
        >
          <UserPlus size={14} />
          Add person
        </button>
      </PageHeader>
      <div
        className="grid grid-cols-3 gap-2 sm:gap-3"
        role="group"
        aria-label="Filter people by role"
      >
        {roleCards.map(({ key, label, icon: Icon }) => {
          const peopleInRole = scopedPeople.filter(
            (person) => displayRole(person) === key,
          );
          const active = peopleInRole.filter(
            (person) => person.status === "Active",
          ).length;
          return (
            <button
              key={key}
              aria-pressed={role === key}
              onClick={() =>
                setRole((current) => (current === key ? "All people" : key))
              }
              className={`surface group relative flex min-w-0 flex-col items-start gap-2 p-3 text-left transition active:scale-[.99] sm:flex-row sm:items-center sm:gap-3 sm:p-4 sm:hover:border-slate-300 ${role === key ? "border-teal ring-1 ring-teal/20" : ""}`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-md sm:h-10 sm:w-10 ${role === key ? "bg-teal text-white" : "bg-slate-100 text-slate-500 group-hover:bg-teal/10 group-hover:text-teal"}`}
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-navy sm:text-sm">
                  {label}
                </span>
                <span className="mt-1 hidden text-[10px] text-slate-500 sm:block">
                  {active} active
                </span>
              </span>
              <span className="font-mono text-xl font-medium text-navy sm:text-2xl">
                {peopleInRole.length}
              </span>
              {role === key ? (
                <Check
                  size={14}
                  className="absolute right-2 top-2 text-teal sm:static"
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <section className="surface mt-4 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-navy">
              {role === "All people" ? "All people" : `${role}s`}
            </h2>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
              {visible.length}
            </span>
            {role !== "All people" ? (
              <button
                onClick={() => setRole("All people")}
                className="text-[10px] font-semibold text-teal hover:underline"
              >
                Clear filter
              </button>
            ) : null}
          </div>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search name, site or skill"
          />
        </div>
        {visible.length ? (
          <>
            <div className="divide-y divide-slate-100 lg:hidden">
              {visible.map((person) => {
                const personRole = displayRole(person);
                return (
                  <button
                    key={person.id}
                    onClick={() => onPerson(person)}
                    className="block w-full p-4 text-left transition active:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">
                          {person.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {personRole} · Shift {person.shift}
                        </p>
                      </div>
                      <StatusPill>{person.status}</StatusPill>
                    </div>
                    <p className="mt-2 truncate text-xs text-slate-500">
                      {siteName(person.siteId)} · {person.skill}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                      <div>
                        <p className="eyebrow">Recorded</p>
                        <p className="mt-1 font-mono text-sm font-medium text-navy">
                          {person.recorded}h
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Uploaded</p>
                        <p className="mt-1 font-mono text-sm font-medium text-navy">
                          {person.uploaded}h
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Accepted</p>
                        <p className="mt-1 font-mono text-sm font-medium text-navy">
                          {person.accepted}h
                        </p>
                      </div>
                    </div>
                    {hardwareSummary(person) !== "Not assigned" ? (
                      <div className="mt-3 flex items-start gap-2 text-xs">
                        <Camera
                          size={14}
                          className="mt-0.5 shrink-0 text-teal"
                        />
                        <span className="min-w-0 break-words font-mono text-navy">
                          {hardwareSummary(person)}
                        </span>
                      </div>
                    ) : null}
                    {personRole !== "Supervisor" ? (
                      <div className="mt-3 flex items-start justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
                        <span className="text-slate-500">In charge</span>
                        <span className="text-right font-medium text-navy">
                          {personRole === "Worker"
                            ? `${operatorFor(person)} · ${supervisorFor(person)}`
                            : supervisorFor(person)}
                        </span>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="table-wrap hidden lg:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Person</th>
                    <th>Type</th>
                    <th>Site & shift</th>
                    <th>Recorded data</th>
                    <th>Hardware</th>
                    <th>In charge</th>
                    <th>Status</th>
                    <th>Last active</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((person) => (
                    <tr
                      key={person.id}
                      onClick={() => onPerson(person)}
                      className="cursor-pointer"
                    >
                      <td>
                        <p className="font-medium text-navy">{person.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                          {person.id}
                        </p>
                      </td>
                      <td>
                        <span className="font-medium text-navy">
                          {displayRole(person)}
                        </span>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {person.job}
                        </p>
                      </td>
                      <td>
                        {siteName(person.siteId)}
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Shift {person.shift} · {person.skill}
                        </p>
                      </td>
                      <td>
                        <span className="font-mono text-sm font-medium text-navy">
                          {person.recorded}h
                        </span>
                        <p className="mt-0.5 whitespace-nowrap text-[10px] text-slate-500">
                          {person.uploaded}h uploaded · {person.accepted}h
                          accepted
                        </p>
                      </td>
                      <td>
                        <span
                          className={`font-mono text-[10px] ${hardwareSummary(person) === "Not assigned" ? "text-slate-400" : "font-medium text-navy"}`}
                        >
                          {hardwareSummary(person)}
                        </span>
                      </td>
                      <td>
                        {displayRole(person) === "Worker" ? (
                          <div className="space-y-1">
                            <p className="text-[10px]">
                              <span className="text-slate-400">Operator</span>{" "}
                              <span className="font-medium text-navy">
                                {operatorFor(person)}
                              </span>
                            </p>
                            <p className="text-[10px]">
                              <span className="text-slate-400">Supervisor</span>{" "}
                              <span className="font-medium text-navy">
                                {supervisorFor(person)}
                              </span>
                            </p>
                          </div>
                        ) : displayRole(person) === "Operator" ? (
                          <p className="text-[10px]">
                            <span className="text-slate-400">Supervisor</span>{" "}
                            <span className="font-medium text-navy">
                              {supervisorFor(person)}
                            </span>
                          </p>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td>
                        <StatusPill>{person.status}</StatusPill>
                        <p className="mt-1 text-[9px] text-slate-400">
                          Consent {person.consent}
                        </p>
                      </td>
                      <td>{person.lastActive}</td>
                      <td>
                        <ChevronRight size={14} className="text-slate-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            icon={UsersRound}
            title={`No ${role === "All people" ? "people" : role.toLowerCase() + "s"} found`}
            detail="Try another role or search term."
          />
        )}
      </section>
    </div>
  );
}

function LiveOperationsPage({
  filteredSites,
  onSite,
  showToast,
}: {
  filteredSites: Site[];
  onSite: (site: Site) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [tab, setTab] = useState("Live board");
  const visibleUploads = uploads.filter((up) =>
    filteredSites.some((site) => site.id === up.siteId),
  );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Today · 03 Sep 2026"
        title="Live Operations"
        description="A shift-level view of attendance, mounted cameras, recording and upload health."
      >
        <span className="flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10px] font-semibold text-emerald-700">
          <Activity size={13} />
          Live · 15:12 IST
        </span>
      </PageHeader>
      <section className="surface overflow-hidden">
        <TabStrip
          tabs={["Live board", "Upload & sync"]}
          active={tab}
          onChange={setTab}
        />
        {tab === "Live board" ? (
          <>
            <div className="grid grid-cols-2 gap-px bg-slate-100 lg:grid-cols-5">
              <div className="bg-white p-4">
                <p className="eyebrow">People present</p>
                <p className="mt-2 font-mono text-2xl text-navy">
                  215<span className="text-sm text-slate-400">/244</span>
                </p>
              </div>
              <div className="bg-white p-4">
                <p className="eyebrow">Mounted cameras</p>
                <p className="mt-2 font-mono text-2xl text-navy">160</p>
              </div>
              <div className="bg-white p-4">
                <p className="eyebrow">Recording now</p>
                <p className="mt-2 font-mono text-2xl text-green">149</p>
              </div>
              <div className="bg-white p-4">
                <p className="eyebrow">Zero-output people</p>
                <p className="mt-2 font-mono text-2xl text-critical">7</p>
              </div>
              <div className="bg-white p-4">
                <p className="eyebrow">Unsynced phones</p>
                <p className="mt-2 font-mono text-2xl text-amber">3</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 border-t border-slate-100 lg:hidden">
              {filteredSites
                .filter(
                  (site) =>
                    site.status === "Live" ||
                    site.status === "At risk" ||
                    site.status === "Paused",
                )
                .map((site) => (
                  <button
                    key={site.id}
                    onClick={() => onSite(site)}
                    className="block w-full p-4 text-left active:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">
                          {site.name}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500">
                          {site.id} · {site.shifts} shifts
                        </p>
                      </div>
                      <StatusPill>{site.status}</StatusPill>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                      <div>
                        <p className="eyebrow">Present</p>
                        <p className="mt-1 font-mono text-sm text-navy">
                          {site.present}/{site.workers}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Cameras</p>
                        <p className="mt-1 font-mono text-sm text-navy">
                          {site.activeCameras}/{site.cameras}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Upload lag</p>
                        <p
                          className={`mt-1 font-mono text-sm ${site.uploadLag > 8 ? "text-critical" : "text-navy"}`}
                        >
                          {site.uploadLag}h
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Recording now</span>
                      <span className="font-medium text-navy">
                        {site.activeCameras
                          ? `${Math.max(0, site.activeCameras - (site.id === "HL-GJ-207" ? 7 : 2))} active`
                          : "Not recording"}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
            <div className="table-wrap hidden lg:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Shift status</th>
                    <th>Attendance</th>
                    <th>Cameras</th>
                    <th>Recording</th>
                    <th>Sync</th>
                    <th>Manager check</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredSites
                    .filter(
                      (s) =>
                        s.status === "Live" ||
                        s.status === "At risk" ||
                        s.status === "Paused",
                    )
                    .map((site) => (
                      <tr
                        key={site.id}
                        onClick={() => onSite(site)}
                        className="cursor-pointer"
                      >
                        <td>
                          <SiteLabel siteId={site.id} />
                        </td>
                        <td>
                          <StatusPill>{site.status}</StatusPill>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {site.shifts} shifts scheduled
                          </p>
                        </td>
                        <td>
                          <span className="font-mono">
                            {site.present}/{site.workers}
                          </span>
                          <p
                            className={`mt-1 text-[10px] ${site.present / site.workers < 0.8 ? "text-critical" : "text-slate-400"}`}
                          >
                            {Math.round((site.present / site.workers) * 100) ||
                              0}
                            % present
                          </p>
                        </td>
                        <td>
                          <span className="font-mono">
                            {site.activeCameras}/{site.cameras}
                          </span>
                          <Progress
                            value={
                              (site.activeCameras / site.cameras) * 100 || 0
                            }
                            tone={
                              site.activeCameras / site.cameras < 0.8
                                ? "amber"
                                : "green"
                            }
                          />
                        </td>
                        <td>
                          {site.activeCameras
                            ? `${Math.max(0, site.activeCameras - (site.id === "HL-GJ-207" ? 7 : 2))} active`
                            : "—"}
                          <p className="mt-1 text-[10px] text-slate-400">
                            {site.id === "HL-GJ-207"
                              ? "7 zero output"
                              : "Within range"}
                          </p>
                        </td>
                        <td>
                          <span
                            className={`font-mono ${site.uploadLag > 8 ? "text-critical" : "text-slate-700"}`}
                          >
                            {site.uploadLag}h
                          </span>
                          <p className="mt-1 text-[10px] text-slate-400">
                            upload lag
                          </p>
                        </td>
                        <td>
                          {site.present ? (
                            <span className="flex items-center gap-1 text-green">
                              <CheckCircle2 size={13} />
                              14:58
                            </span>
                          ) : (
                            <span className="text-slate-400">Not due</span>
                          )}
                        </td>
                        <td>
                          <ChevronRight size={14} className="text-slate-300" />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
        {tab === "Upload & sync" ? (
          <>
            <div className="grid grid-cols-2 gap-px bg-slate-100 lg:grid-cols-4">
              <div className="bg-white p-4">
                <p className="eyebrow">Queue</p>
                <p className="mt-2 font-mono text-xl text-navy">132.6 GB</p>
              </div>
              <div className="bg-white p-4">
                <p className="eyebrow">Failed batches</p>
                <p className="mt-2 font-mono text-xl text-critical">2</p>
              </div>
              <div className="bg-white p-4">
                <p className="eyebrow">All-synced sites</p>
                <p className="mt-2 font-mono text-xl text-green">2 / 4</p>
              </div>
              <div className="bg-white p-4">
                <p className="eyebrow">Oldest backlog</p>
                <p className="mt-2 font-mono text-xl text-amber">31.5h</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 border-t border-slate-100 lg:hidden">
              {visibleUploads.map((up) => (
                <article key={up.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-navy">
                        {up.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {siteName(up.siteId)} · {up.device}
                      </p>
                    </div>
                    <StatusPill>{up.status}</StatusPill>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3">
                    <div>
                      <p className="eyebrow">Backlog</p>
                      <p className="mt-1 font-mono text-sm text-navy">
                        {up.size} · {up.age}h
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow">ETA</p>
                      <p className="mt-1 font-mono text-sm text-navy">
                        {up.eta}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">{up.reason}</p>
                  <button
                    className="btn-secondary mt-3 w-full"
                    onClick={() =>
                      showToast(
                        up.status === "Failed"
                          ? "Escalation prepared"
                          : "Retry queued",
                        `${up.id} includes device, backlog age and failure context.`,
                      )
                    }
                  >
                    {up.status === "Failed" ? "Escalate batch" : "Retry upload"}
                  </button>
                </article>
              ))}
            </div>
            <div className="table-wrap hidden lg:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Site</th>
                    <th>Device / SD</th>
                    <th>Last sync</th>
                    <th>Backlog</th>
                    <th>Failure context</th>
                    <th>Retry</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visibleUploads.map((up) => (
                    <tr key={up.id}>
                      <td className="font-mono text-navy">{up.id}</td>
                      <td>{siteName(up.siteId)}</td>
                      <td className="font-mono">{up.device}</td>
                      <td>
                        {up.lastSync}
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {up.age}h old
                        </p>
                      </td>
                      <td>
                        {up.size}
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          ETA {up.eta}
                        </p>
                      </td>
                      <td>{up.reason}</td>
                      <td>
                        <span className="font-mono">{up.retries}</span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary !h-7"
                          onClick={() =>
                            showToast(
                              up.status === "Failed"
                                ? "Escalation prepared"
                                : "Retry queued",
                              `${up.id} includes device, backlog age and failure context.`,
                            )
                          }
                        >
                          {up.status === "Failed" ? "Escalate" : "Retry"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}

function ProductionPage({
  filteredSites,
  onRecord,
  showToast,
}: {
  filteredSites: Site[];
  onRecord: (record: (typeof production)[number]) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date" | "accepted" | "status">("date");
  const q = useDeferredValue(search.toLowerCase());
  const rows = production
    .filter(
      (r) =>
        filteredSites.some((s) => s.id === r.siteId) &&
        `${r.id} ${r.task} ${r.worker} ${r.operator}`.toLowerCase().includes(q),
    )
    .toSorted((a, b) =>
      sort === "accepted"
        ? b.accepted - a.accepted
        : sort === "status"
          ? a.status.localeCompare(b.status)
          : b.id.localeCompare(a.id),
    );
  const taskCoverage = [
    { task: "CNC loading", actual: 104, target: 120 },
    { task: "MIG welding", actual: 71, target: 110 },
    { task: "Power loom", actual: 132, target: 125 },
    { task: "Fabric inspection", actual: 86, target: 100 },
    { task: "Carton sealing", actual: 32, target: 80 },
  ];
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Output ledger"
        title="Production"
        description="One end-to-end definition from recording to Humyn Labs acceptance."
      >
        <button
          className="btn-secondary"
          onClick={() =>
            showToast(
              "Report scheduled",
              "A weekly production CSV will preserve the selected filters and permission scope.",
            )
          }
        >
          <CalendarDays size={14} />
          Schedule report
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            showToast(
              "Export prepared",
              `${rows.length} day-level records are ready to download.`,
            )
          }
        >
          <Download size={14} />
          Export rows
        </button>
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-[1fr_.6fr]">
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Output drill-down"
            meta="Day · shift · task · worker · operator · camera"
          />
          <div className="flex flex-col gap-2 p-3 sm:flex-row sm:justify-between">
            <SearchBox
              value={search}
              onChange={setSearch}
              placeholder="Search exact output records"
            />
            <select
              className="control"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
            >
              <option value="date">Latest first</option>
              <option value="accepted">Accepted hours</option>
              <option value="status">Validation status</option>
            </select>
          </div>
          <div className="divide-y divide-slate-100 border-t border-slate-100 lg:hidden">
            {rows.map((row) => (
              <button
                key={row.id}
                onClick={() => onRecord(row)}
                className="block w-full p-4 text-left active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium text-navy">
                      {row.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {row.date} · Shift {row.shift}
                    </p>
                  </div>
                  <StatusPill>{row.status}</StatusPill>
                </div>
                <p className="mt-3 text-sm font-semibold text-navy">
                  {row.task}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {siteName(row.siteId)} · {row.worker}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {row.operator} ·{" "}
                  <span className="font-mono">{row.camera}</span>
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="eyebrow">Recorded</p>
                    <p className="mt-1 font-mono text-sm text-navy">
                      {row.raw}h
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Uploaded</p>
                    <p className="mt-1 font-mono text-sm text-navy">
                      {row.uploaded}h
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Accepted</p>
                    <p className="mt-1 font-mono text-sm font-semibold text-navy">
                      {row.accepted}h
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="table-wrap hidden lg:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Site / shift</th>
                  <th>Task</th>
                  <th>People</th>
                  <th>Camera</th>
                  <th>Hours R / U / A</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRecord(row)}
                    className="cursor-pointer"
                  >
                    <td className="font-mono text-navy">
                      {row.id}
                      <p className="mt-0.5 text-[9px] text-slate-400">
                        {row.date}
                      </p>
                    </td>
                    <td>
                      {siteName(row.siteId)}
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Shift {row.shift}
                      </p>
                    </td>
                    <td>{row.task}</td>
                    <td>
                      {row.worker}
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {row.operator}
                      </p>
                    </td>
                    <td className="font-mono">{row.camera}</td>
                    <td className="font-mono">
                      {row.raw} / {row.uploaded} / <b>{row.accepted}</b>
                    </td>
                    <td>
                      <StatusPill>{row.status}</StatusPill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Task & worker coverage"
            meta="Target versus accepted hours · monthly"
          />
          <div className="space-y-4 p-4">
            {taskCoverage.map((task) => (
              <button key={task.task} className="block w-full text-left">
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="font-medium text-navy">{task.task}</span>
                  <span
                    className={`font-mono ${task.actual / task.target < 0.75 ? "text-critical" : "text-slate-500"}`}
                  >
                    {task.actual}/{task.target}h
                  </span>
                </div>
                <Progress
                  value={(task.actual / task.target) * 100}
                  tone={
                    task.actual / task.target < 0.75
                      ? "red"
                      : task.actual / task.target < 0.9
                        ? "amber"
                        : "green"
                  }
                />
                {task.actual / task.target < 0.75 ? (
                  <p className="mt-1 text-[9px] text-critical">
                    Underrepresented · rebalance recommended
                  </p>
                ) : null}
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">
                Largest worker concentration
              </span>
              <b className="font-mono text-xs text-navy">12.4%</b>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Within the 15% concentration guide.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function QualityPage({
  filteredSites,
  issues,
  onIssue,
  showToast,
}: {
  filteredSites: Site[];
  issues: QualityIssue[];
  onIssue: (issue: QualityIssue) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const visible = issues.filter((issue) =>
    filteredSites.some((s) => s.id === issue.siteId),
  );
  const issueHours = visible.reduce((a, i) => a + i.hours, 0);
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="HL validation"
        title="Quality"
        description="See every rejection reason, expected correction and immutable Humyn Labs verdict."
      >
        <button
          className="btn-secondary"
          onClick={() =>
            showToast(
              "Quality guide opened",
              "Camera mounting quality guide v3.2 · effective 18 Aug 2026.",
            )
          }
        >
          <BookOpenCheck size={14} />
          Quality guide
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            showToast(
              "Quality report prepared",
              "The weekly quality report retains your site and task scope.",
            )
          }
        >
          <Download size={14} />
          Export report
        </button>
      </PageHeader>
      <div className="mobile-odd-metrics grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard
          label="Acceptance"
          value="87.9%"
          delta="+2.1 pts"
          detail="Accepted ÷ validated hours"
          icon={BadgeCheck}
          tone="green"
        />
        <MetricCard
          label="Ops yield"
          value="91.4%"
          delta="+1.3 pts"
          detail="Uploaded ÷ recorded hours"
          icon={UploadCloud}
        />
        <MetricCard
          label="Rejected"
          value={`${issueHours.toFixed(1)}h`}
          delta="-3.2h"
          detail="4 samples require correction"
          icon={FileWarning}
          tone="red"
        />
        <MetricCard
          label="Open actions"
          value={`${visible.filter((i) => i.state !== "Closed").length}`}
          detail="Feedback to HL recheck"
          icon={ClipboardCheck}
          tone="amber"
        />
        <MetricCard
          label="Recheck SLA"
          value="18.6h"
          delta="+4.2h"
          detail="Median time to verdict"
          icon={Clock3}
          tone="amber"
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Rejection mix"
            meta="Affected hours by reason · selected period"
          />
          <div className="flex flex-col items-center sm:h-[245px] sm:flex-row">
            <div className="h-[210px] w-full sm:h-full sm:w-[55%]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {qualityMix.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    contentStyle={{
                      border: "1px solid #dfe5e9",
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 px-4 pb-4 sm:block sm:w-auto sm:space-y-3 sm:px-0 sm:pb-0">
              {qualityMix.map((item) => (
                <button
                  key={item.name}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <span
                    className="h-2 w-2 rounded-sm"
                    style={{ background: item.color }}
                  />
                  <span className="flex-1 text-[11px] text-slate-600">
                    {item.name}
                  </span>
                  <b className="font-mono text-[11px] text-navy">
                    {item.value}%
                  </b>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Own-network benchmark"
            meta="Acceptance by your sites · sample-weighted · no cross-partner ranking"
          />
          <div className="h-[245px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sites.filter((s) => s.acceptance > 0)}
                margin={{ left: -20, right: 10, top: 12 }}
              >
                <CartesianGrid stroke="#EDF1F3" vertical={false} />
                <XAxis
                  dataKey="city"
                  tick={{ fontSize: 10, fill: "#73818B" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fontSize: 10, fill: "#73818B" }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  contentStyle={{
                    border: "1px solid #dfe5e9",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                />
                <Bar
                  dataKey="acceptance"
                  fill="#31696D"
                  radius={[3, 3, 0, 0]}
                  barSize={28}
                >
                  {sites
                    .filter((s) => s.acceptance > 0)
                    .map((s) => (
                      <Cell
                        key={s.id}
                        fill={s.acceptance < 85 ? "#C8872D" : "#31696D"}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <section className="surface mt-4 overflow-hidden">
        <SectionHeader
          title="Feedback & corrective actions"
          meta="Issue → owner → evidence → resubmission → HL verdict"
        />
        <div className="divide-y divide-slate-100 lg:hidden">
          {visible.map((issue) => (
            <button
              key={issue.id}
              onClick={() => onIssue(issue)}
              className="block w-full p-4 text-left active:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-navy">
                    {issue.id}
                  </span>
                  <Severity value={issue.severity} />
                </div>
                <StatusPill>{issue.state}</StatusPill>
              </div>
              <p className="mt-3 text-sm font-semibold text-navy">
                {issue.reason}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {issue.note}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                <div>
                  <p className="eyebrow">Site</p>
                  <p className="mt-1 font-medium text-navy">
                    {siteName(issue.siteId)}
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    {issue.sample}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Affected / due</p>
                  <p className="mt-1 font-mono font-medium text-navy">
                    {issue.hours}h · {issue.due}
                  </p>
                  <p className="mt-0.5 text-slate-500">{issue.owner}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">Evidence</span>
                <span className="text-right font-medium text-navy">
                  {issue.evidence}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="table-wrap hidden lg:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue</th>
                <th>Site / sample</th>
                <th>Reason</th>
                <th>Affected</th>
                <th>Owner / due</th>
                <th>Corrective stage</th>
                <th>Evidence</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => onIssue(issue)}
                  className="cursor-pointer"
                >
                  <td>
                    <span className="font-mono font-medium text-navy">
                      {issue.id}
                    </span>
                    <p className="mt-1">
                      <Severity value={issue.severity} />
                    </p>
                  </td>
                  <td>
                    <SiteLabel siteId={issue.siteId} />
                    <p className="mt-1 font-mono text-[9px] text-slate-400">
                      {issue.sample}
                    </p>
                  </td>
                  <td>
                    <p className="font-medium text-navy">{issue.reason}</p>
                    <p className="mt-1 max-w-[260px] truncate text-[10px] text-slate-500">
                      {issue.note}
                    </p>
                  </td>
                  <td className="font-mono">{issue.hours}h</td>
                  <td>
                    {issue.owner}
                    <p
                      className={`mt-1 text-[10px] ${issue.due === "Overdue" ? "text-critical" : "text-slate-400"}`}
                    >
                      {issue.due}
                    </p>
                  </td>
                  <td>
                    <StatusPill>{issue.state}</StatusPill>
                  </td>
                  <td>{issue.evidence}</td>
                  <td>
                    <ChevronRight size={14} className="text-slate-300" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HardwarePage({
  filteredSites,
  onAsset,
  showToast,
}: {
  filteredSites: Site[];
  onAsset: (asset: Asset) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [tab, setTab] = useState("Asset custody");
  const [search, setSearch] = useState("");
  const q = useDeferredValue(search.toLowerCase());
  const visible = assets.filter(
    (asset) =>
      filteredSites.some((s) => s.id === asset.siteId) &&
      `${asset.id} ${asset.serial} ${asset.holder}`.toLowerCase().includes(q),
  );
  const exposure = visible
    .filter((a) => ["Overdue", "Damaged", "Missing"].includes(a.status))
    .reduce((a, b) => a + b.exposure, 0);
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Custody ledger"
        title="Hardware"
        description="Every assigned asset, holder, movement and camera–SD pairing under your responsibility."
      >
        <button
          className="btn-secondary"
          onClick={() =>
            showToast(
              "Scanner ready",
              "Scan an asset QR to open its scoped custody record.",
            )
          }
        >
          <ScanLine size={14} />
          Scan QR
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            showToast(
              "Return started",
              "A return draft was created with reconciliation pending.",
            )
          }
        >
          <RotateCcw size={14} />
          Start return
        </button>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Assets held"
          value={`${visible.length}`}
          detail="Cameras, SD cards, phones and kits"
          icon={Boxes}
        />
        <MetricCard
          label="Assigned value"
          value={money.format(visible.reduce((a, b) => a + b.exposure, 0))}
          detail="Partner-accountable exposure"
          icon={IndianRupee}
        />
        <MetricCard
          label="Exceptions"
          value={`${visible.filter((a) => ["Overdue", "Damaged", "Missing"].includes(a.status)).length}`}
          detail="Overdue, damaged or missing"
          icon={AlertTriangle}
          tone="red"
        />
        <MetricCard
          label="At-risk exposure"
          value={money.format(exposure)}
          detail="Applicable asset value"
          icon={ShieldCheck}
          tone={exposure ? "amber" : "green"}
        />
      </div>
      <section className="surface mt-4 overflow-hidden">
        <TabStrip
          tabs={[
            "Asset custody",
            "Camera–SD traceability",
            "Dispatch & returns",
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === "Asset custody" ? (
          <>
            <div className="flex flex-col gap-2 p-3 sm:flex-row sm:justify-between">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search asset, serial or holder"
              />
              <button
                className="btn-secondary"
                onClick={() =>
                  showToast(
                    "Asset register exported",
                    `${visible.length} assets and their latest custody events are included.`,
                  )
                }
              >
                <Download size={14} />
                Export register
              </button>
            </div>
            <div className="divide-y divide-slate-100 border-t border-slate-100 lg:hidden">
              {visible.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => onAsset(asset)}
                  className="block w-full p-4 text-left active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-navy">
                        {asset.id}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-slate-500">
                        {asset.serial} · {asset.type}
                      </p>
                    </div>
                    <StatusPill>{asset.status}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm font-medium text-navy">
                    {asset.holder}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {siteName(asset.siteId)} · held {asset.daysHeld} days
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                    <div>
                      <p className="eyebrow">Last movement</p>
                      <p className="mt-1 leading-5 text-navy">
                        {asset.lastMove}
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow">Expected return</p>
                      <p
                        className={`mt-1 font-medium ${asset.status === "Overdue" ? "text-critical" : "text-navy"}`}
                      >
                        {asset.expectedReturn}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="table-wrap hidden lg:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Site</th>
                    <th>Current holder</th>
                    <th>Status</th>
                    <th>Last movement</th>
                    <th>Expected return</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => onAsset(asset)}
                      className="cursor-pointer"
                    >
                      <td>
                        <p className="font-mono font-medium text-navy">
                          {asset.id}
                        </p>
                        <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                          {asset.serial}
                        </p>
                      </td>
                      <td>{asset.type}</td>
                      <td>{siteName(asset.siteId)}</td>
                      <td>
                        {asset.holder}
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Held {asset.daysHeld} days
                        </p>
                      </td>
                      <td>
                        <StatusPill>{asset.status}</StatusPill>
                      </td>
                      <td>{asset.lastMove}</td>
                      <td
                        className={
                          asset.status === "Overdue"
                            ? "font-medium text-critical"
                            : ""
                        }
                      >
                        {asset.expectedReturn}
                      </td>
                      <td>
                        <ChevronRight size={14} className="text-slate-300" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
        {tab === "Camera–SD traceability" ? (
          <div>
            <div className="border-b border-slate-100 p-3">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search camera, SD or operator"
              />
            </div>
            <div className="divide-y divide-slate-100 lg:hidden">
              {assets
                .filter(
                  (asset) =>
                    asset.type === "Camera" &&
                    asset.paired &&
                    asset.paired !== "—" &&
                    filteredSites.some((site) => site.id === asset.siteId),
                )
                .map((asset, index) => (
                  <article key={asset.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-teal/10 text-teal">
                        <Camera size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm font-semibold text-navy">
                          {asset.id} ↔ {asset.paired}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {siteName(asset.siteId)}
                        </p>
                      </div>
                      <StatusPill>
                        {index === 1 ? "Completed" : "Active"}
                      </StatusPill>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                      <div>
                        <p className="eyebrow">Operator</p>
                        <p className="mt-1 font-medium text-navy">
                          {asset.holder}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Worker {184 + index * 17}
                        </p>
                      </div>
                      <div>
                        <p className="eyebrow">Task / batch</p>
                        <p className="mt-1 font-medium text-navy">
                          {["CNC loading", "MIG welding", "Power loom"][index]}
                        </p>
                        <p className="mt-1 font-mono text-slate-500">
                          UP-{788 + index}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
            <div className="table-wrap hidden lg:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Camera</th>
                    <th>Paired SD</th>
                    <th>Site</th>
                    <th>Operator</th>
                    <th>Worker / task</th>
                    <th>Mounted</th>
                    <th>Unmounted</th>
                    <th>Upload batch</th>
                  </tr>
                </thead>
                <tbody>
                  {assets
                    .filter(
                      (a) =>
                        a.type === "Camera" &&
                        a.paired &&
                        a.paired !== "—" &&
                        filteredSites.some((s) => s.id === a.siteId),
                    )
                    .map((asset, index) => (
                      <tr key={asset.id}>
                        <td className="font-mono text-navy">{asset.id}</td>
                        <td className="font-mono text-teal">{asset.paired}</td>
                        <td>{siteName(asset.siteId)}</td>
                        <td>{asset.holder}</td>
                        <td>
                          Worker {184 + index * 17}
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {
                              ["CNC loading", "MIG welding", "Power loom"][
                                index
                              ]
                            }
                          </p>
                        </td>
                        <td>03 Sep · 06:0{4 + index}</td>
                        <td>{index === 1 ? "13:58" : "Active"}</td>
                        <td className="font-mono">UP-{788 + index}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        {tab === "Dispatch & returns" ? (
          <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-navy">
                    Movement register
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    HQ ↔ site handoffs and reconciliation
                  </p>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    showToast(
                      "Receipt confirmed",
                      "Receiver, timestamp and proof were added to the custody trail.",
                    )
                  }
                >
                  <PackageCheck size={14} />
                  Confirm receipt
                </button>
              </div>
              <div className="space-y-2 lg:hidden">
                <article className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-navy">
                        TR-481
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Humyn HQ → Nandi Electronics
                      </p>
                    </div>
                    <StatusPill>In transit</StatusPill>
                  </div>
                  <p className="mt-3 text-xs text-navy">
                    40 cameras · 42 SD · 2 kits
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    BlueDart 77410022 · ETA 04 Sep
                  </p>
                </article>
                <article className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-navy">
                        TR-472
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ganga Foods → Humyn HQ
                      </p>
                    </div>
                    <StatusPill>Review</StatusPill>
                  </div>
                  <p className="mt-3 text-xs text-navy">16 cameras · 18 SD</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Delhivery 1784019 · received 01 Sep
                  </p>
                </article>
              </div>
              <div className="hidden overflow-hidden rounded-lg border border-slate-200 lg:block">
                <table className="data-table !min-w-[620px]">
                  <thead>
                    <tr>
                      <th>Transfer</th>
                      <th>Route</th>
                      <th>Courier / ETA</th>
                      <th>Assets</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono">TR-481</td>
                      <td>Humyn HQ → Nandi Electronics</td>
                      <td>
                        BlueDart 77410022
                        <p className="mt-1 text-[10px] text-slate-400">
                          ETA 04 Sep
                        </p>
                      </td>
                      <td>40 cameras · 42 SD · 2 kits</td>
                      <td>
                        <StatusPill>In transit</StatusPill>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-mono">TR-472</td>
                      <td>Ganga Foods → Humyn HQ</td>
                      <td>
                        Delhivery 1784019
                        <p className="mt-1 text-[10px] text-slate-400">
                          Received 01 Sep
                        </p>
                      </td>
                      <td>16 cameras · 18 SD</td>
                      <td>
                        <StatusPill>Review</StatusPill>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
              <div className="flex items-center gap-2 text-critical">
                <AlertTriangle size={16} />
                <h3 className="text-sm font-semibold">
                  Reconciliation exception
                </h3>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-700">
                Transfer TR-472 contains two fewer SD cards than the dispatch
                manifest.
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <dt className="text-slate-500">Expected</dt>
                  <dd className="mt-1 font-mono text-sm text-navy">20 SD</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Received</dt>
                  <dd className="mt-1 font-mono text-sm text-critical">
                    18 SD
                  </dd>
                </div>
              </dl>
              <button
                className="btn-primary mt-4 w-full"
                onClick={() =>
                  showToast(
                    "Incident created",
                    "The exception is linked to transfer TR-472 and its proof of receipt.",
                  )
                }
              >
                <FileWarning size={14} />
                Create incident
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function PaymentsPage({
  filteredSites,
  invoices,
  onInvoice,
  showToast,
}: {
  filteredSites: Site[];
  invoices: typeof invoiceData;
  onInvoice: (invoice: (typeof invoiceData)[number]) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const visible = invoices.filter((inv) =>
    filteredSites.some((s) => s.id === inv.siteId),
  );
  const payable = visible
    .filter((i) => i.status !== "Paid")
    .reduce((a, b) => a + b.amount, 0);
  const paid = visible
    .filter((i) => i.status === "Paid")
    .reduce((a, b) => a + b.amount, 0);
  const totalAccepted = visible.reduce((a, b) => a + b.accepted, 0);
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Commercial ledger"
        title="Payments"
        description="Trace Humyn-approved output into estimates, invoices, adjustments and paid amounts."
      >
        <button
          className="btn-secondary"
          onClick={() =>
            showToast(
              "Statement scheduled",
              "Monthly payment statements will retain the selected partner scope.",
            )
          }
        >
          <CalendarDays size={14} />
          Schedule statement
        </button>
        <button
          className="btn-primary"
          onClick={() =>
            showToast(
              "Invoice workspace opened",
              "A draft invoice starts from the current approved payable breakdown.",
            )
          }
        >
          <ReceiptText size={14} />
          Prepare invoice
        </button>
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Approved output"
          value={`${totalAccepted}h`}
          detail="Final accepted units in listed periods"
          icon={BadgeCheck}
          tone="green"
        />
        <MetricCard
          label="Payable estimate"
          value={money.format(payable)}
          detail="Gross less applicable adjustments"
          icon={CircleDollarSign}
        />
        <MetricCard
          label="Scheduled"
          value={money.format(
            visible
              .filter((i) => i.status === "Scheduled")
              .reduce((a, b) => a + b.amount, 0),
          )}
          detail="Expected in the next 7 days"
          icon={Clock3}
          tone="green"
        />
        <MetricCard
          label="Paid"
          value={money.format(paid)}
          detail="Reconciled to payment reference"
          icon={Banknote}
          tone="green"
        />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[.45fr_1.55fr]">
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Payable calculation"
            meta="Calculation version PAY-v3.4 · updated 15:02 IST"
          />
          <div className="space-y-3 p-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Approved output</span>
              <b className="font-mono text-navy">{totalAccepted}h</b>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Weighted rate basis</span>
              <b className="font-mono text-navy">₹418 / h</b>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Gross payable</span>
              <b className="font-mono text-navy">
                {money.format(visible.reduce((a, b) => a + b.gross, 0))}
              </b>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-3 text-xs">
              <span className="text-slate-500">
                Quality / commercial adjustments
              </span>
              <b className="font-mono text-critical">
                {money.format(visible.reduce((a, b) => a + b.adjustments, 0))}
              </b>
            </div>
            <div className="flex justify-between rounded-md bg-teal/[0.06] p-3">
              <span className="text-xs font-semibold text-teal">
                Net approved
              </span>
              <b className="font-mono text-base text-teal">
                {money.format(visible.reduce((a, b) => a + b.amount, 0))}
              </b>
            </div>
          </div>
          <div className="border-t border-slate-100 p-4">
            <button
              className="btn-secondary w-full"
              onClick={() =>
                showToast(
                  "Calculation history opened",
                  "Rate basis, adjustments and version changes are shown as immutable events.",
                )
              }
            >
              <History size={14} />
              View calculation history
            </button>
          </div>
        </section>
        <section className="surface overflow-hidden">
          <SectionHeader
            title="Invoice & payment tracker"
            meta="Draft → submitted → reviewed → scheduled → paid"
          />
          <div className="divide-y divide-slate-100 lg:hidden">
            {visible.map((invoice) => (
              <button
                key={invoice.id}
                onClick={() => onInvoice(invoice)}
                className="block w-full p-4 text-left active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-medium text-navy">
                      {invoice.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {invoice.period} · {siteName(invoice.siteId)}
                    </p>
                  </div>
                  <StatusPill>{invoice.status}</StatusPill>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Net amount</p>
                    <p className="mt-1 font-mono text-xl font-medium text-navy">
                      {money.format(invoice.amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="eyebrow">Approved</p>
                    <p className="mt-1 font-mono text-sm text-navy">
                      {invoice.accepted}h
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="eyebrow">Gross</p>
                    <p className="mt-1 font-mono text-navy">
                      {money.format(invoice.gross)}
                    </p>
                  </div>
                  <div>
                    <p className="eyebrow">Adjustment</p>
                    <p className="mt-1 font-mono text-critical">
                      {money.format(invoice.adjustments)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  {invoice.paid === "—"
                    ? `Expected ${invoice.expected}`
                    : `Paid ${invoice.paid}`}
                </p>
              </button>
            ))}
          </div>
          <div className="table-wrap hidden lg:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Period / site</th>
                  <th>Approved units</th>
                  <th>Gross</th>
                  <th>Adjustments</th>
                  <th>Net amount</th>
                  <th>Status</th>
                  <th>Expected / paid</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onClick={() => onInvoice(invoice)}
                    className="cursor-pointer"
                  >
                    <td className="font-mono font-medium text-navy">
                      {invoice.id}
                    </td>
                    <td>
                      {invoice.period}
                      <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-400">
                        {siteName(invoice.siteId)}
                      </p>
                    </td>
                    <td className="font-mono">{invoice.accepted}h</td>
                    <td className="font-mono">{money.format(invoice.gross)}</td>
                    <td className="font-mono text-critical">
                      {money.format(invoice.adjustments)}
                    </td>
                    <td className="font-mono font-medium text-navy">
                      {money.format(invoice.amount)}
                    </td>
                    <td>
                      <StatusPill>{invoice.status}</StatusPill>
                    </td>
                    <td>
                      {invoice.paid === "—" ? invoice.expected : invoice.paid}
                    </td>
                    <td>
                      <ChevronRight size={14} className="text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function HelpPage({
  showToast,
}: {
  showToast: (title: string, detail: string) => void;
}) {
  const [tab, setTab] = useState("Help centre");
  const [search, setSearch] = useState("");
  const visibleDocs = docs.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page-enter">
      <PageHeader eyebrow="Help" title="Help and SOPs" description="">
        <button className="btn-primary" onClick={() => setTab("Support")}>
          <MessageSquareWarning size={14} />
          Raise support issue
        </button>
      </PageHeader>
      <section className="surface overflow-hidden">
        <TabStrip
          tabs={["Help centre", "Support"]}
          active={tab}
          onChange={setTab}
        />
        {tab === "Help centre" ? (
          <div>
            <div className="border-b border-slate-100 p-4">
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search SOPs and guidance"
              />
            </div>
            <div className="grid gap-px bg-slate-100 md:grid-cols-2">
              {visibleDocs.map((doc) => (
                <button
                  key={doc.title}
                  onClick={() =>
                    showToast(
                      "Document opened",
                      `${doc.title} ${doc.version} · read-only partner copy.`,
                    )
                  }
                  className="bg-white p-4 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-md bg-teal/10 p-2 text-teal">
                      <BookOpenCheck size={17} />
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {doc.version}
                    </span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-navy">
                    {doc.title}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-400">
                    <span>Effective {doc.date}</span>
                    <span>{doc.owner}</span>
                    <span>{doc.language}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {tab === "Support" ? (
          <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-navy">
                  Tickets & disputes
                </h3>
                <button
                  className="btn-primary"
                  onClick={() =>
                    showToast(
                      "Ticket draft ready",
                      "Add a linked record and evidence before submitting.",
                    )
                  }
                >
                  <Send size={14} />
                  New ticket
                </button>
              </div>
              <div className="mt-4 space-y-2 lg:hidden">
                <article className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-navy">
                        SUP-191
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        INV-2026-081 · Payment query
                      </p>
                    </div>
                    <StatusPill>Under review</StatusPill>
                  </div>
                  <p className="mt-3 text-xs text-navy">₹18,420 affected</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Humyn Finance · 18h remaining
                  </p>
                </article>
                <article className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-medium text-navy">
                        SUP-188
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        CAM-0387 · Hardware return
                      </p>
                    </div>
                    <StatusPill>Acknowledged</StatusPill>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Partner Success · 4h remaining
                  </p>
                </article>
              </div>
              <div className="mt-4 hidden overflow-hidden rounded-lg border border-slate-200 lg:block">
                <table className="data-table !min-w-[640px]">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Linked record</th>
                      <th>Category</th>
                      <th>Owner / SLA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono">SUP-191</td>
                      <td>INV-2026-081</td>
                      <td>
                        Payment query
                        <p className="mt-1 text-[10px] text-slate-400">
                          ₹18,420 affected
                        </p>
                      </td>
                      <td>
                        Humyn Finance
                        <p className="mt-1 text-[10px] text-slate-400">
                          18h remaining
                        </p>
                      </td>
                      <td>
                        <StatusPill>Under review</StatusPill>
                      </td>
                    </tr>
                    <tr>
                      <td className="font-mono">SUP-188</td>
                      <td>CAM-0387</td>
                      <td>Hardware return</td>
                      <td>
                        Partner Success
                        <p className="mt-1 text-[10px] text-slate-400">
                          4h remaining
                        </p>
                      </td>
                      <td>
                        <StatusPill>Acknowledged</StatusPill>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="eyebrow">Support contact</p>
              <p className="mt-3 text-sm font-semibold text-navy">
                Partner Success desk
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Mon–Sat · 08:00–20:00 IST
              </p>
              <div className="mt-5 space-y-2">
                <button className="btn-secondary w-full justify-start">
                  <MessageSquareWarning size={14} />
                  In-app support
                </button>
                <button className="btn-secondary w-full justify-start">
                  <ExternalLink size={14} />
                  Escalation guide
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SiteDrawer({
  site,
  actions,
  issues,
  onClose,
  onPerson,
  onAsset,
  onRecord,
  onIssue,
  onAction,
  showToast,
}: {
  site: Site;
  actions: ActionItem[];
  issues: QualityIssue[];
  onClose: () => void;
  onPerson: (person: Person) => void;
  onAsset: (asset: Asset) => void;
  onRecord: (record: (typeof production)[number]) => void;
  onIssue: (issue: QualityIssue) => void;
  onAction: (action: ActionItem) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  const checklist = [
    ["Facility agreement", site.id === "HL-KA-141" ? "Missing" : "Complete"],
    ["Permissions & consent", site.id === "HL-UP-118" ? "Expired" : "Complete"],
    ["Approved tasks", site.id === "HL-RJ-063" ? "1 rejected" : "Complete"],
    ["Shifts configured", "Complete"],
    ["Staffing", site.operators < site.requiredOperators ? "Gap" : "Complete"],
    ["Devices assigned", "Complete"],
    ["Training", site.readiness < 90 ? "In progress" : "Complete"],
    ["App access", "Complete"],
  ];
  const sitePeople = people.filter((person) => person.siteId === site.id);
  const siteAssets = assets.filter((asset) => asset.siteId === site.id);
  const siteRecords = production.filter((record) => record.siteId === site.id);
  const siteIssues = issues.filter((issue) => issue.siteId === site.id);
  const siteUploads = uploads.filter((upload) => upload.siteId === site.id);
  const siteActions = actions.filter(
    (action) => action.siteId === site.id && action.state !== "Resolved",
  );
  const hardwareProfile = [
    ["Cameras", site.cameras, Camera],
    ["SD cards", site.cameras + 4, Smartphone],
    ["Upload phones", Math.max(1, Math.ceil(site.cameras / 24)), Smartphone],
    ["Accessory kits", Math.max(1, Math.ceil(site.cameras / 20)), Wrench],
  ] as const;
  const siteHardwareValue =
    site.cameras * 68000 +
    (site.cameras + 4) * 6200 +
    Math.max(1, Math.ceil(site.cameras / 24)) * 24000 +
    Math.max(1, Math.ceil(site.cameras / 20)) * 18500;
  return (
    <Drawer
      title={site.name}
      eyebrow={`${site.id} · ${site.city}, ${site.state}`}
      onClose={onClose}
      width="max-w-5xl"
    >
      <TabStrip
        tabs={[
          "Overview",
          "People & roles",
          "Hardware",
          "Operations",
          "Readiness",
          "HL decisions",
          "Relationship",
          "Documents",
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === "Overview" ? (
        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <StatusPill>{site.status}</StatusPill>
              <p className="mt-3 text-sm font-medium text-navy">
                {site.type} facility
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} />
                {site.city}, {site.state}
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() =>
                showToast(
                  "Change request started",
                  "Permitted operating details can be proposed; the existing approved plan remains active.",
                )
              }
            >
              <Wrench size={14} />
              Request change
            </button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Workers", site.workers],
              ["Shifts", site.shifts],
              ["Cameras", site.cameras],
              ["Accepted", `${site.accepted}h`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-slate-200 p-3">
                <p className="eyebrow">{k}</p>
                <p className="mt-2 font-mono text-lg text-navy">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-slate-200">
            <SectionHeader
              title="Operating plan"
              meta="Partner-maintained details"
            />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-4 text-xs">
              <div>
                <dt className="text-slate-500">Site manager</dt>
                <dd className="mt-1 font-medium text-navy">{site.manager}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Planned start</dt>
                <dd className="mt-1 font-medium text-navy">05 Sep 2026</dd>
              </div>
              <div>
                <dt className="text-slate-500">Approved tasks</dt>
                <dd className="mt-1 font-medium text-navy">8 tasks</dd>
              </div>
              <div>
                <dt className="text-slate-500">Access window</dt>
                <dd className="mt-1 font-medium text-navy">05:30–23:00 IST</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
      {tab === "People & roles" ? (
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-navy">People</h3>
            <button
              className="btn-secondary"
              onClick={() =>
                showToast(
                  "Invite flow opened",
                  `New people will be scoped to ${site.name}.`,
                )
              }
            >
              <UserPlus size={14} />
              Add person
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="eyebrow">Workers</p>
              <p className="mt-2 font-mono text-xl text-navy">{site.workers}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="eyebrow">Operators</p>
              <p
                className={`mt-2 font-mono text-xl ${site.operators < site.requiredOperators ? "text-critical" : "text-navy"}`}
              >
                {site.operators}/{site.requiredOperators}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="eyebrow">Supervisor</p>
              <p className="mt-2 truncate text-sm font-semibold text-navy">
                {site.manager}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="eyebrow">Shifts</p>
              <p className="mt-2 font-mono text-xl text-navy">{site.shifts}</p>
            </div>
          </div>
          <section className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <SectionHeader title="Site roster" />
            {sitePeople.length ? (
              <>
                <div className="divide-y divide-slate-100 lg:hidden">
                  {sitePeople.map((person) => (
                    <button
                      key={person.id}
                      onClick={() => onPerson(person)}
                      className="block w-full p-4 text-left active:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-navy">
                            {person.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {displayRole(person)} · Shift {person.shift}
                          </p>
                        </div>
                        <StatusPill>{person.status}</StatusPill>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {person.skill}
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                        <div>
                          <p className="eyebrow">Recorded</p>
                          <p className="mt-1 font-mono text-sm text-navy">
                            {person.recorded}h
                          </p>
                        </div>
                        <div>
                          <p className="eyebrow">Uploaded</p>
                          <p className="mt-1 font-mono text-sm text-navy">
                            {person.uploaded}h
                          </p>
                        </div>
                        <div>
                          <p className="eyebrow">Accepted</p>
                          <p className="mt-1 font-mono text-sm font-medium text-navy">
                            {person.accepted}h
                          </p>
                        </div>
                      </div>
                      {hardwareSummary(person) !== "Not assigned" ? (
                        <p className="mt-3 break-words font-mono text-xs text-navy">
                          {hardwareSummary(person)}
                        </p>
                      ) : null}
                      {displayRole(person) !== "Supervisor" ? (
                        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                          In charge ·{" "}
                          <span className="font-medium text-navy">
                            {displayRole(person) === "Worker"
                              ? `${operatorFor(person)} · ${supervisorFor(person)}`
                              : supervisorFor(person)}
                          </span>
                        </p>
                      ) : null}
                    </button>
                  ))}
                </div>
                <div className="table-wrap hidden lg:block">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Person</th>
                        <th>Role</th>
                        <th>Shift / task</th>
                        <th>Recorded data</th>
                        <th>Hardware</th>
                        <th>In charge</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {sitePeople.map((person) => (
                        <tr
                          key={person.id}
                          onClick={() => onPerson(person)}
                          className="cursor-pointer"
                        >
                          <td>
                            <p className="font-medium text-navy">
                              {person.name}
                            </p>
                            <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                              {person.id}
                            </p>
                          </td>
                          <td>{displayRole(person)}</td>
                          <td>
                            {person.shift}
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {person.skill}
                            </p>
                          </td>
                          <td>
                            <span className="font-mono font-medium text-navy">
                              {person.recorded}h
                            </span>
                            <p className="mt-0.5 whitespace-nowrap text-[9px] text-slate-400">
                              {person.uploaded}h uploaded · {person.accepted}h
                              accepted
                            </p>
                          </td>
                          <td>
                            <span
                              className={`font-mono text-[9px] ${hardwareSummary(person) === "Not assigned" ? "text-slate-400" : "font-medium text-navy"}`}
                            >
                              {hardwareSummary(person)}
                            </span>
                          </td>
                          <td>
                            {displayRole(person) === "Worker" ? (
                              <div className="space-y-1">
                                <p className="text-[10px]">
                                  <span className="text-slate-400">
                                    Operator
                                  </span>{" "}
                                  <b className="text-navy">
                                    {operatorFor(person)}
                                  </b>
                                </p>
                                <p className="text-[10px]">
                                  <span className="text-slate-400">
                                    Supervisor
                                  </span>{" "}
                                  <b className="text-navy">
                                    {supervisorFor(person)}
                                  </b>
                                </p>
                              </div>
                            ) : displayRole(person) === "Operator" ? (
                              <p className="text-[10px]">
                                <span className="text-slate-400">
                                  Supervisor
                                </span>{" "}
                                <b className="text-navy">
                                  {supervisorFor(person)}
                                </b>
                              </p>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td>
                            <StatusPill>{person.status}</StatusPill>
                          </td>
                          <td>
                            <ChevronRight
                              size={14}
                              className="text-slate-300"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <EmptyState
                icon={UsersRound}
                title="No individual records yet"
                detail="Add people to this site to populate the roster."
              />
            )}
          </section>
        </div>
      ) : null}
      {tab === "Hardware" ? (
        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-navy">Hardware</h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal/10 px-3 py-2 font-mono text-xs font-medium text-teal">
                {money.format(siteHardwareValue)}
              </span>
              <button
                className="btn-secondary"
                onClick={() =>
                  showToast(
                    "Hardware workspace opened",
                    `${site.name} was applied as the active site scope.`,
                  )
                }
              >
                <ScanLine size={14} />
                Scan asset
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {hardwareProfile.map(([label, value, Icon]) => (
              <div
                key={label}
                className="rounded-md border border-slate-200 p-3"
              >
                <span className="flex items-center justify-between">
                  <span className="eyebrow">{label}</span>
                  <Icon size={14} className="text-teal" />
                </span>
                <p className="mt-2 font-mono text-xl text-navy">{value}</p>
                {label === "Cameras" ? (
                  <p className="mt-1 text-[10px] text-slate-500">
                    {site.activeCameras} recording now
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <section className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <SectionHeader title="Custody register" />
            {siteAssets.length ? (
              <>
                <div className="divide-y divide-slate-100 lg:hidden">
                  {siteAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => onAsset(asset)}
                      className="block w-full p-4 text-left active:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-medium text-navy">
                            {asset.id}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {asset.type} · {asset.serial}
                          </p>
                        </div>
                        <StatusPill>{asset.status}</StatusPill>
                      </div>
                      <p className="mt-3 text-sm font-medium text-navy">
                        {asset.holder}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                        <span className="font-mono text-teal">
                          {asset.paired ?? "Not paired"}
                        </span>
                        <span
                          className={
                            asset.status === "Overdue"
                              ? "font-medium text-critical"
                              : "text-slate-500"
                          }
                        >
                          {asset.expectedReturn}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="table-wrap hidden lg:block">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Type</th>
                        <th>Current holder</th>
                        <th>Status</th>
                        <th>Pairing</th>
                        <th>Expected return</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {siteAssets.map((asset) => (
                        <tr
                          key={asset.id}
                          onClick={() => onAsset(asset)}
                          className="cursor-pointer"
                        >
                          <td>
                            <p className="font-mono font-medium text-navy">
                              {asset.id}
                            </p>
                            <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                              {asset.serial}
                            </p>
                          </td>
                          <td>{asset.type}</td>
                          <td>{asset.holder}</td>
                          <td>
                            <StatusPill>{asset.status}</StatusPill>
                          </td>
                          <td className="font-mono text-[10px]">
                            {asset.paired ?? "—"}
                          </td>
                          <td>{asset.expectedReturn}</td>
                          <td>
                            <ChevronRight
                              size={14}
                              className="text-slate-300"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Camera}
                title="No serialized assets synced"
                detail="No serialized assets are assigned to this site."
              />
            )}
          </section>
        </div>
      ) : null}
      {tab === "Operations" ? (
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-navy">
                Today at {site.name}
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                Attendance, collection, uploads, output and quality exceptions
                in one operating view.
              </p>
            </div>
            <StatusPill>{site.status}</StatusPill>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["People present", `${site.present}/${site.workers}`],
              ["Cameras recording", `${site.activeCameras}/${site.cameras}`],
              ["Accepted output", `${site.accepted}h`],
              [
                "Acceptance rate",
                site.acceptance ? `${site.acceptance}%` : "—",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border border-slate-200 p-3"
              >
                <p className="eyebrow">{label}</p>
                <p className="mt-2 font-mono text-xl text-navy">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <section className="overflow-hidden rounded-lg border border-slate-200">
              <SectionHeader
                title="Open actions"
                meta="What the site team should do next"
              />
              {siteActions.length ? (
                <div className="divide-y divide-slate-100">
                  {siteActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => onAction(action)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-50"
                    >
                      <Severity value={action.severity} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-navy">
                          {action.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-500">
                          {action.owner} · due {action.due}
                        </span>
                      </span>
                      <ChevronRight size={13} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs text-slate-500">
                  No open actions for this site.
                </p>
              )}
            </section>
            <section className="overflow-hidden rounded-lg border border-slate-200">
              <SectionHeader
                title="Upload & sync"
                meta={`${site.uploadLag}h current site lag`}
              />
              {siteUploads.length ? (
                <div className="divide-y divide-slate-100">
                  {siteUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex items-center gap-3 p-3"
                    >
                      <span className="font-mono text-[10px] text-navy">
                        {upload.id}
                      </span>
                      <span className="min-w-0 flex-1 text-[10px] text-slate-500">
                        {upload.device} · {upload.size} · {upload.reason}
                      </span>
                      <StatusPill>{upload.status}</StatusPill>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs text-slate-500">
                  No upload exceptions in the selected period.
                </p>
              )}
            </section>
            <section className="overflow-hidden rounded-lg border border-slate-200">
              <SectionHeader
                title="Recent output"
                meta="Recorded → uploaded → accepted"
              />
              {siteRecords.length ? (
                <div className="divide-y divide-slate-100">
                  {siteRecords.slice(0, 4).map((record) => (
                    <button
                      key={record.id}
                      onClick={() => onRecord(record)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-50"
                    >
                      <span className="font-mono text-[10px] text-navy">
                        {record.id}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-navy">
                          {record.task}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-500">
                          {record.worker} · {record.operator}
                        </span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {record.raw}/{record.uploaded}/{record.accepted}h
                      </span>
                      <ChevronRight size={13} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs text-slate-500">
                  No output records in the selected period.
                </p>
              )}
            </section>
            <section className="overflow-hidden rounded-lg border border-slate-200">
              <SectionHeader
                title="Quality feedback"
                meta="Humyn Labs validation and correction status"
              />
              {siteIssues.length ? (
                <div className="divide-y divide-slate-100">
                  {siteIssues.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => onIssue(issue)}
                      className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-50"
                    >
                      <Severity value={issue.severity} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-navy">
                          {issue.reason}
                        </span>
                        <span className="mt-1 block text-[10px] text-slate-500">
                          {issue.hours}h affected · {issue.owner}
                        </span>
                      </span>
                      <StatusPill>{issue.state}</StatusPill>
                      <ChevronRight size={13} className="text-slate-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs text-slate-500">
                  No quality feedback for this site.
                </p>
              )}
            </section>
          </div>
        </div>
      ) : null}
      {tab === "Readiness" ? (
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Go-live readiness</p>
              <p className="mt-1 font-mono text-3xl text-navy">
                {site.readiness}%
              </p>
            </div>
            <div className="w-1/2">
              <Progress
                value={site.readiness}
                tone={site.readiness < 80 ? "amber" : "green"}
              />
            </div>
          </div>
          <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {checklist.map(([item, status]) => (
              <div key={item} className="flex items-center gap-3 p-3">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full ${status === "Complete" ? "bg-green/10 text-green" : "bg-amber/10 text-amber"}`}
                >
                  {status === "Complete" ? (
                    <Check size={13} />
                  ) : (
                    <Clock3 size={13} />
                  )}
                </span>
                <span className="flex-1 text-xs font-medium text-navy">
                  {item}
                </span>
                <span
                  className={`text-[10px] ${status === "Complete" ? "text-green" : "text-amber"}`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
            Partner-owned items can be completed here. Humyn Labs review
            decisions remain read-only.
          </p>
        </div>
      ) : null}
      {tab === "HL decisions" ? (
        <div className="p-5">
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Site identification</p>
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    Version 3 · submitted 21 Aug, 10:42 IST
                  </p>
                </div>
                <StatusPill>
                  {site.stage === "Task review" ? "Accepted" : "Accepted"}
                </StatusPill>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                Site ID, identity and operating information reviewed by Humyn
                Labs.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  className="btn-secondary"
                  onClick={() =>
                    showToast(
                      "Original form opened",
                      "The Site Identification form is opened in read-only workflow context.",
                    )
                  }
                >
                  <ExternalLink size={14} />
                  Open original form
                </button>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    showToast(
                      "New version created",
                      "Corrections retain the same Site ID and previous versions.",
                    )
                  }
                >
                  <FileSpreadsheet size={14} />
                  Correct & resubmit
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Recce & task review</p>
                  <p className="mt-2 font-mono text-xs text-slate-500">
                    Decision 01 Sep, 18:14 IST
                  </p>
                </div>
                <StatusPill>
                  {site.id === "HL-RJ-063" ? "Review" : "Accepted"}
                </StatusPill>
              </div>
              <div className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-100">
                <div className="flex justify-between p-3 text-xs">
                  <span>Workstation layout</span>
                  <StatusPill>Accepted</StatusPill>
                </div>
                <div className="flex justify-between p-3 text-xs">
                  <span>Task: carton sealing</span>
                  <StatusPill>
                    {site.id === "HL-RJ-063" ? "Rejected" : "Accepted"}
                  </StatusPill>
                </div>
                <div className="flex justify-between p-3 text-xs">
                  <span>Task: quality inspection</span>
                  <StatusPill>Pending</StatusPill>
                </div>
              </div>
              <button
                className="btn-primary mt-4"
                onClick={() =>
                  showToast(
                    "Resubmission ready",
                    "Rejected tasks can be remapped with new sample evidence; the original verdict is preserved.",
                  )
                }
              >
                <Send size={14} />
                Remap & resubmit
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {tab === "Relationship" ? (
        <div className="p-5">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="eyebrow">Factory SPOC</p>
            <p className="mt-2 text-sm font-semibold text-navy">
              Priya Kulkarni · Plant HR
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Access window 05:30–23:00 · No recording in inspection bay 4
            </p>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-navy">
                Commitment history
              </h3>
              <button
                className="btn-secondary"
                onClick={() =>
                  showToast(
                    "Visit note started",
                    "Add the visit, agreed action, due date and supporting proof.",
                  )
                }
              >
                <ClipboardList size={14} />
                Record visit
              </button>
            </div>
            <div className="mt-3 border-l border-slate-200 pl-4">
              <div className="relative pb-5">
                <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-teal" />
                <p className="text-xs font-medium text-navy">
                  Electrical points confirmed
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  02 Sep · Owner: Facilities · proof attached
                </p>
              </div>
              <div className="relative pb-5">
                <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-amber" />
                <p className="text-xs font-medium text-navy">
                  Night-shift lighting check
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Due 04 Sep · Owner: {site.manager}
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-slate-300" />
                <p className="text-xs font-medium text-navy">
                  Next factory review
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  08 Sep · dependent on task approval
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {tab === "Documents" ? (
        <div className="p-5">
          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-semibold text-navy">
                Agreements & compliance
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">
                Permitted partner documents only
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() =>
                showToast(
                  "Upload workspace opened",
                  "Document type, version, expiry and signatory fields will be validated before submission.",
                )
              }
            >
              <UploadCloud size={14} />
              Upload
            </button>
          </div>
          <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {[
              [
                "Facility agreement",
                site.id === "HL-KA-141" ? "Missing" : "Approved",
                "v2.0",
                "31 Dec 2026",
              ],
              ["Worker consent pack", "Approved", "v1.8", "30 Nov 2026"],
              [
                "Site access permission",
                site.id === "HL-UP-118" ? "Expired" : "Approved",
                "v3.1",
                "18 Oct 2026",
              ],
            ].map((d) => (
              <div key={d[0]} className="flex items-center gap-3 p-3">
                <FileCheck2 size={16} className="text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-navy">{d[0]}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {d[2]} · expiry {d[3]}
                  </p>
                </div>
                <StatusPill>{d[1]}</StatusPill>
                <button className="btn-ghost">
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function PersonDrawer({
  person,
  onClose,
  showToast,
}: {
  person: Person;
  onClose: () => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [tab, setTab] = useState("Work data");
  const role = displayRole(person);
  const assignedHardware = hardwareFor(person);
  return (
    <Drawer
      title={person.name}
      eyebrow={`${person.id} · ${role}`}
      onClose={onClose}
    >
      <TabStrip
        tabs={["Work data", "Training", "Access & history"]}
        active={tab}
        onChange={setTab}
      />
      {tab === "Work data" ? (
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <SiteLabel siteId={person.siteId} />
              <p className="mt-2 text-xs text-slate-500">
                {person.job} · Shift {person.shift} · {person.skill}
              </p>
            </div>
            <StatusPill>{person.status}</StatusPill>
          </div>
          {role === "Worker" || role === "Operator" ? (
            <section className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <SectionHeader title="In charge" />
              <div
                className={`grid gap-px bg-slate-200 ${role === "Worker" ? "grid-cols-2" : "grid-cols-1"}`}
              >
                {role === "Worker" ? (
                  <div className="bg-white p-4">
                    <p className="eyebrow">Operator</p>
                    <p className="mt-2 text-sm font-semibold text-navy">
                      {operatorFor(person)}
                    </p>
                  </div>
                ) : null}
                <div className="bg-white p-4">
                  <p className="eyebrow">Supervisor</p>
                  <p className="mt-2 text-sm font-semibold text-navy">
                    {supervisorFor(person)}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
          {assignedHardware.camera ||
          assignedHardware.sdCard ||
          assignedHardware.phone ? (
            <section className="mt-5 overflow-hidden rounded-lg border border-slate-200">
              <SectionHeader title="Assigned hardware" />
              <div className="grid grid-cols-1 gap-px bg-slate-200 sm:grid-cols-3">
                {[
                  ["Camera", assignedHardware.camera],
                  ["SD card", assignedHardware.sdCard],
                  ["Upload device", assignedHardware.phone],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white p-4">
                    <p className="eyebrow">{label}</p>
                    <p
                      className={`mt-2 break-all font-mono text-sm font-medium ${value ? "text-navy" : "text-slate-400"}`}
                    >
                      {value ?? "Not assigned"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <section className="mt-5 overflow-hidden rounded-lg border border-slate-200">
            <SectionHeader title="Recorded data" />
            <div className="grid grid-cols-3 gap-px bg-slate-200">
              {[
                ["Recorded", `${person.recorded}h`],
                ["Uploaded", `${person.uploaded}h`],
                ["Accepted", `${person.accepted}h`],
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-4">
                  <p className="eyebrow">{label}</p>
                  <p className="mt-2 font-mono text-xl font-medium text-navy">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 p-4">
              <div className="flex justify-between">
                <p className="text-xs font-semibold text-navy">
                  Acceptance rate
                </p>
                <b className="font-mono text-sm text-navy">
                  {person.acceptance ? `${person.acceptance}%` : "—"}
                </b>
              </div>
              <div className="mt-2">
                <Progress
                  value={person.acceptance}
                  tone={
                    person.acceptance && person.acceptance < 85
                      ? "amber"
                      : "green"
                  }
                />
              </div>
            </div>
          </section>
          <div className="mt-4 flex gap-2">
            <button
              className="btn-primary flex-1"
              onClick={() =>
                showToast(
                  "Coaching task assigned",
                  `Quality coaching was assigned to ${person.name}.`,
                )
              }
            >
              <GraduationCap size={14} />
              Coach
            </button>
            <button
              className="btn-secondary flex-1"
              onClick={() =>
                showToast(
                  "Reassignment draft",
                  "The proposed site and effective date require approval.",
                )
              }
            >
              <UserRoundCog size={14} />
              Reassign
            </button>
          </div>
        </div>
      ) : null}
      {tab === "Training" ? (
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Training completion</p>
              <p className="mt-1 font-mono text-3xl text-navy">
                {person.training}%
              </p>
            </div>
            <GraduationCap size={28} className="text-teal" />
          </div>
          <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {[
              ["Partner onboarding", "v2.1", "100%", "18 Aug"],
              [
                "Camera mounting",
                "v3.2",
                person.training < 90 ? "78%" : "100%",
                "22 Aug",
              ],
              [
                "Quality correction SOP",
                "v4.8",
                person.training < 90 ? "Assigned" : "96%",
                "01 Sep",
              ],
              [
                "Collection app update",
                person.app,
                person.app === "2.14.1" ? "Current" : "Update due",
                "Today",
              ],
            ].map((r) => (
              <div key={r[0]} className="flex items-center gap-3 p-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-teal/10 text-teal">
                  <CheckCircle2 size={14} />
                </span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-navy">{r[0]}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {r[1]} · {r[3]}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-slate-600">
                  {r[2]}
                </span>
              </div>
            ))}
          </div>
          <button
            className="btn-primary mt-4 w-full"
            onClick={() =>
              showToast(
                "Retraining assigned",
                "The current SOP version and reason are recorded in the training history.",
              )
            }
          >
            <GraduationCap size={14} />
            Assign retraining
          </button>
        </div>
      ) : null}
      {tab === "Access & history" ? (
        <div className="p-5">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-navy">
                  Collection app access
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  Version {person.app} · last sync {person.lastActive}
                </p>
              </div>
              <StatusPill>
                {person.status === "Active" ? "Active" : "Inactive"}
              </StatusPill>
            </div>
          </div>
          <div className="mt-5">
            <p className="eyebrow">Lifecycle history</p>
            <div className="mt-3 space-y-4 border-l border-slate-200 pl-4 text-xs">
              <div>
                <p className="font-medium text-navy">
                  Assigned to {siteName(person.siteId)}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  18 Aug · approved by Partner owner
                </p>
              </div>
              <div>
                <p className="font-medium text-navy">App access activated</p>
                <p className="mt-1 text-[10px] text-slate-400">
                  18 Aug · assigned site only
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              className="btn-secondary"
              onClick={() =>
                showToast(
                  "Replacement request opened",
                  "Reason, effective date and replacement candidate are required.",
                )
              }
            >
              <UserPlus size={14} />
              Replacement
            </button>
            <button
              className="btn-secondary"
              onClick={() =>
                showToast(
                  "Deactivation draft",
                  "This reversible partner-owned action will preserve history.",
                )
              }
            >
              <WifiOff size={14} />
              Deactivate
            </button>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function ActionDrawer({
  action,
  onClose,
  onUpdate,
  showToast,
}: {
  action: ActionItem;
  onClose: () => void;
  onUpdate: (id: string, state: ActionItem["state"]) => void;
  showToast: (title: string, detail: string) => void;
}) {
  return (
    <Drawer
      title={action.title}
      eyebrow={`${action.id} · ${action.type}`}
      onClose={onClose}
    >
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Severity value={action.severity} />
          <StatusPill>{action.state}</StatusPill>
          <span className="text-[10px] text-slate-400">
            Open {action.age} · Due {action.due}
          </span>
        </div>
        <div className="mt-5 rounded-lg border border-slate-200 p-4">
          <SiteLabel siteId={action.siteId} />
          <p className="mt-3 text-xs leading-5 text-slate-600">
            {action.detail}
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-teal/20 bg-teal/[0.04] p-4">
          <p className="eyebrow text-teal">Next action</p>
          <p className="mt-2 text-xs leading-5 text-slate-700">{action.next}</p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
          <div>
            <dt className="text-slate-500">Owner</dt>
            <dd className="mt-1 font-medium text-navy">{action.owner}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Escalation</dt>
            <dd className="mt-1 font-medium text-navy">Partner Ops Lead</dd>
          </div>
          <div>
            <dt className="text-slate-500">Source system</dt>
            <dd className="mt-1 font-medium text-navy">Collection Monitor</dd>
          </div>
          <div>
            <dt className="text-slate-500">Last updated</dt>
            <dd className="mt-1 font-medium text-navy">03 Sep · 15:05 IST</dd>
          </div>
        </dl>
        <div className="mt-6 flex gap-2">
          {action.state === "Open" ? (
            <button
              className="btn-secondary flex-1"
              onClick={() => {
                onUpdate(action.id, "Acknowledged");
                showToast(
                  "Action acknowledged",
                  `${action.id} is now assigned to you.`,
                );
              }}
            >
              <CheckCircle2 size={14} />
              Acknowledge
            </button>
          ) : null}
          <button
            className="btn-primary flex-1"
            onClick={() => {
              onUpdate(action.id, "Resolved");
              showToast(
                "Marked resolved",
                "The action remains in the audit trail with your timestamp.",
              );
              onClose();
            }}
          >
            <Check size={14} />
            Resolve
          </button>
          <button
            className="btn-secondary !w-9 !px-0"
            onClick={() =>
              showToast(
                "Escalation prepared",
                "The exact issue context and linked records will be included.",
              )
            }
          >
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function QualityDrawer({
  issue,
  onClose,
  onUpdate,
  showToast,
}: {
  issue: QualityIssue;
  onClose: () => void;
  onUpdate: (id: string, state: QualityIssue["state"]) => void;
  showToast: (title: string, detail: string) => void;
}) {
  const stages = [
    "Issue",
    "Acknowledged",
    "Retraining",
    "Recollection",
    "Evidence",
    "HL recheck",
    "Verdict",
  ];
  const stageIndex =
    issue.state === "New"
      ? 0
      : issue.state === "Acknowledged"
        ? 1
        : issue.state === "Retraining"
          ? 2
          : issue.state === "Recollecting"
            ? 3
            : issue.state === "HL recheck"
              ? 5
              : 6;
  return (
    <Drawer
      title={`${issue.reason} · ${issue.hours}h affected`}
      eyebrow={`${issue.id} · ${issue.sample}`}
      onClose={onClose}
      width="max-w-2xl"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <SiteLabel siteId={issue.siteId} />
            <p className="mt-2 text-xs text-slate-500">
              Feedback received 02 Sep · 18:42 IST
            </p>
          </div>
          <div className="flex gap-2">
            <Severity value={issue.severity} />
            <StatusPill>{issue.state}</StatusPill>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <div className="flex min-w-[620px] items-center">
            {stages.map((stage, index) => (
              <div key={stage} className="flex flex-1 items-center">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${index <= stageIndex ? "bg-teal text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {index < stageIndex ? <Check size={11} /> : index + 1}
                </span>
                <span
                  className={`ml-1.5 text-[9px] ${index <= stageIndex ? "font-medium text-teal" : "text-slate-400"}`}
                >
                  {stage}
                </span>
                {index < stages.length - 1 ? (
                  <span
                    className={`mx-2 h-px flex-1 ${index < stageIndex ? "bg-teal" : "bg-slate-200"}`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_.7fr]">
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="eyebrow">Humyn Labs feedback</p>
            <p className="mt-3 text-sm font-semibold text-navy">
              {issue.reason}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              {issue.note}
            </p>
            <div className="mt-4 aspect-video rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <Video size={22} className="mx-auto text-slate-400" />
                  <p className="mt-2 text-[10px] text-slate-500">
                    Example frame · {issue.sample}
                    <br />
                    Evidence available in approved system
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="eyebrow">Correction owner</p>
              <p className="mt-2 text-xs font-semibold text-navy">
                {issue.owner}
              </p>
              <p
                className={`mt-1 text-[10px] ${issue.due === "Overdue" ? "text-critical" : "text-slate-500"}`}
              >
                Due {issue.due}
              </p>
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 p-4">
              <p className="eyebrow">Required evidence</p>
              <p className="mt-2 text-xs text-slate-700">{issue.evidence}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-800">
          <b>Verdict control:</b> the partner can respond, retrain, recollect
          and submit evidence. Only Humyn Labs can set or change the validation
          verdict.
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="btn-secondary"
            onClick={() => {
              onUpdate(issue.id, "Acknowledged");
              showToast(
                "Feedback acknowledged",
                "Owner and timestamp were added to the corrective action history.",
              );
            }}
          >
            <CheckCircle2 size={14} />
            Acknowledge
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              onUpdate(issue.id, "Retraining");
              showToast(
                "Retraining recorded",
                "SOP version and completion evidence are now required.",
              );
            }}
          >
            <GraduationCap size={14} />
            Record retraining
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onUpdate(issue.id, "HL recheck");
              showToast(
                "Submitted for HL recheck",
                "Evidence was attached; the verdict remains pending and read-only.",
              );
            }}
          >
            <Send size={14} />
            Submit evidence
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function AssetDrawer({
  asset,
  onClose,
  showToast,
}: {
  asset: Asset;
  onClose: () => void;
  showToast: (title: string, detail: string) => void;
}) {
  return (
    <Drawer
      title={asset.id}
      eyebrow={`${asset.type} · ${asset.serial}`}
      onClose={onClose}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-slate-500">{asset.qr}</p>
            <p className="mt-2 text-sm font-semibold text-navy">
              Held by {asset.holder}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {siteName(asset.siteId)}
            </p>
          </div>
          <StatusPill>{asset.status}</StatusPill>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ["Received", asset.received],
            ["Days held", asset.daysHeld],
            ["Expected return", asset.expectedReturn],
            ["Exposure", money.format(asset.exposure)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-slate-200 p-3">
              <p className="eyebrow">{k}</p>
              <p className="mt-2 font-mono text-sm text-navy">{v}</p>
            </div>
          ))}
        </div>
        {asset.paired ? (
          <div className="mt-4 rounded-lg border border-teal/20 bg-teal/[0.04] p-4">
            <div className="flex items-center gap-2">
              <Link2 size={15} className="text-teal" />
              <p className="text-xs font-semibold text-teal">Current pairing</p>
            </div>
            <p className="mt-2 font-mono text-sm text-navy">
              {asset.id} ↔ {asset.paired}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Latest trail linked to upload batch UP-788
            </p>
          </div>
        ) : null}
        <div className="mt-5">
          <p className="eyebrow">Custody history</p>
          <div className="mt-3 border-l border-slate-200 pl-4">
            <div className="relative pb-5">
              <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-teal" />
              <p className="text-xs font-medium text-navy">{asset.lastMove}</p>
              <p className="mt-1 text-[10px] text-slate-500">
                03 Sep · recorded by {asset.holder}
              </p>
            </div>
            <div className="relative pb-5">
              <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-slate-300" />
              <p className="text-xs font-medium text-navy">Handoff confirmed</p>
              <p className="mt-1 text-[10px] text-slate-500">
                {asset.received} · receiver proof attached
              </p>
            </div>
            <div className="relative">
              <span className="absolute -left-[20.5px] top-1 h-2 w-2 rounded-full bg-slate-300" />
              <p className="text-xs font-medium text-navy">
                Dispatched from Humyn HQ
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                Transfer TR-441 · manifest verified
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            className="btn-primary flex-1"
            onClick={() =>
              showToast(
                "Handoff confirmed",
                "Holder, condition, site and timestamp were appended to the custody history.",
              )
            }
          >
            <PackageCheck size={14} />
            Confirm handoff
          </button>
          <button
            className="btn-secondary flex-1"
            onClick={() =>
              showToast(
                "Incident draft opened",
                "Add reason, evidence, recovery owner and replacement requirement.",
              )
            }
          >
            <FileWarning size={14} />
            Report issue
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function RecordDrawer({
  record,
  onClose,
  showToast,
}: {
  record: (typeof production)[number];
  onClose: () => void;
  showToast: (title: string, detail: string) => void;
}) {
  return (
    <Drawer
      title={record.id}
      eyebrow={`${record.date} · Shift ${record.shift}`}
      onClose={onClose}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <SiteLabel siteId={record.siteId} />
          <StatusPill>{record.status}</StatusPill>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ["Recorded", record.raw],
            ["Uploaded", record.uploaded],
            ["Accepted", record.accepted],
          ].map(([k, v]) => (
            <div key={k} className="rounded-md border border-slate-200 p-3">
              <p className="eyebrow">{k}</p>
              <p className="mt-2 font-mono text-lg text-navy">{v}h</p>
            </div>
          ))}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-4 text-xs">
          <div>
            <dt className="text-slate-500">Task</dt>
            <dd className="mt-1 font-medium text-navy">{record.task}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Worker</dt>
            <dd className="mt-1 font-medium text-navy">{record.worker}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Operator</dt>
            <dd className="mt-1 font-medium text-navy">{record.operator}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Camera</dt>
            <dd className="mt-1 font-mono font-medium text-navy">
              {record.camera}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Upload batch</dt>
            <dd className="mt-1 font-mono font-medium text-navy">UP-788</dd>
          </div>
          <div>
            <dt className="text-slate-500">Last sync</dt>
            <dd className="mt-1 font-medium text-navy">15:01 IST</dd>
          </div>
        </dl>
        <div className="mt-5 rounded-lg border border-slate-200">
          <SectionHeader title="Audit trail" meta="Source and status events" />
          <div className="divide-y divide-slate-100 text-xs">
            <div className="flex justify-between p-3">
              <span>Recorded on collection app</span>
              <span className="font-mono text-slate-400">03 Sep · 14:08</span>
            </div>
            <div className="flex justify-between p-3">
              <span>Server received</span>
              <span className="font-mono text-slate-400">03 Sep · 15:01</span>
            </div>
            <div className="flex justify-between p-3">
              <span>HL validation decision</span>
              <span className="font-mono text-slate-400">03 Sep · 15:09</span>
            </div>
          </div>
        </div>
        <button
          className="btn-secondary mt-5 w-full"
          onClick={() =>
            showToast(
              "Record exported",
              `${record.id} includes source timestamps and the current validation verdict.`,
            )
          }
        >
          <Download size={14} />
          Export this record
        </button>
      </div>
    </Drawer>
  );
}

function InvoiceDrawer({
  invoice,
  onClose,
  showToast,
}: {
  invoice: (typeof invoiceData)[number];
  onClose: () => void;
  showToast: (title: string, detail: string) => void;
}) {
  return (
    <Drawer
      title={invoice.id}
      eyebrow={`${invoice.period} · ${siteName(invoice.siteId)}`}
      onClose={onClose}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-2xl font-medium text-navy">
            {money.format(invoice.amount)}
          </p>
          <StatusPill>{invoice.status}</StatusPill>
        </div>
        <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 text-xs">
          <div className="flex justify-between p-3">
            <span className="text-slate-500">Approved output</span>
            <b className="font-mono text-navy">{invoice.accepted}h</b>
          </div>
          <div className="flex justify-between p-3">
            <span className="text-slate-500">Rate basis</span>
            <b className="font-mono text-navy">₹{invoice.rate}/h</b>
          </div>
          <div className="flex justify-between p-3">
            <span className="text-slate-500">Gross payable</span>
            <b className="font-mono text-navy">{money.format(invoice.gross)}</b>
          </div>
          <div className="flex justify-between p-3">
            <span className="text-slate-500">Adjustments</span>
            <b className="font-mono text-critical">
              {money.format(invoice.adjustments)}
            </b>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <FileWarning size={15} />
            <p className="text-xs font-semibold">Adjustment ADJ-440</p>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-slate-700">
            18.6 hours excluded after validation. Calculation version PAY-v3.4 ·
            effective 01 Aug 2026.
          </p>
        </div>
        <div className="mt-5">
          <p className="eyebrow">Payment timeline</p>
          <div className="mt-3 space-y-3 border-l border-slate-200 pl-4 text-xs">
            <div>
              <p className="font-medium text-navy">Invoice submitted</p>
              <p className="mt-1 text-[10px] text-slate-400">
                01 Sep · Partner Finance
              </p>
            </div>
            <div>
              <p className="font-medium text-navy">Under Humyn Labs review</p>
              <p className="mt-1 text-[10px] text-slate-400">
                02 Sep · SLA 2 business days
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-400">Expected payment</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {invoice.expected}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            className="btn-primary flex-1"
            onClick={() =>
              showToast(
                "Invoice submission ready",
                "The approved breakdown and required document checks are attached.",
              )
            }
          >
            <ReceiptText size={14} />
            Submit invoice
          </button>
          <button
            className="btn-secondary flex-1"
            onClick={() =>
              showToast(
                "Payment query opened",
                "The query is linked to this invoice, affected amount and calculation version.",
              )
            }
          >
            <MessageSquareWarning size={14} />
            Raise query
          </button>
        </div>
      </div>
    </Drawer>
  );
}

function SystemStatesModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState("Healthy");
  return (
    <Modal title="Data freshness & interface states" onClose={onClose}>
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {["Healthy", "Loading", "Empty", "Warning", "Error"].map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium ${state === s ? "border-teal bg-teal/5 text-teal" : "border-slate-200 text-slate-500"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-5 min-h-44 rounded-lg border border-slate-200 p-4">
          {state === "Healthy" ? (
            <div className="flex h-36 flex-col items-center justify-center text-center">
              <CheckCircle2 size={28} className="text-green" />
              <p className="mt-3 text-sm font-semibold text-navy">
                All partner feeds are current
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Collection 15:05 · Validation 15:02 · Payments 14:48 IST
              </p>
            </div>
          ) : null}
          {state === "Loading" ? (
            <div className="space-y-3">
              <div className="skeleton h-5 w-40 rounded" />
              <div className="skeleton h-10 rounded" />
              <div className="skeleton h-10 rounded" />
              <div className="skeleton h-10 rounded" />
            </div>
          ) : null}
          {state === "Empty" ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="No records for this scope"
              detail="The current filters are valid, but no records were returned."
            />
          ) : null}
          {state === "Warning" ? (
            <div className="flex h-36 flex-col items-center justify-center text-center">
              <AlertTriangle size={28} className="text-amber" />
              <p className="mt-3 text-sm font-semibold text-navy">
                Validation feed is 34 minutes old
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Existing decisions remain visible with their source timestamp.
              </p>
            </div>
          ) : null}
          {state === "Error" ? (
            <div className="flex h-36 flex-col items-center justify-center text-center">
              <WifiOff size={28} className="text-critical" />
              <p className="mt-3 text-sm font-semibold text-navy">
                Could not refresh upload status
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Last known values from 14:52 IST are still shown.
              </p>
              <button className="btn-secondary mt-3">
                <RefreshCw size={13} />
                Try again
              </button>
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-[10px] leading-4 text-slate-500">
          Every metric shows its source, event time, refresh time and timezone.
          These prototype states demonstrate loading, empty, warning and
          recoverable error behaviour.
        </p>
      </div>
    </Modal>
  );
}

function ReportModal({
  onClose,
  showToast,
}: {
  onClose: () => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [frequency, setFrequency] = useState("Weekly");
  return (
    <Modal title="Export or schedule a report" onClose={onClose}>
      <div className="space-y-4 p-5">
        <label className="block">
          <span className="label">Report</span>
          <select className="control mt-1 w-full">
            <option>Network operations briefing</option>
            <option>Weekly quality report</option>
            <option>Monthly payment statement</option>
          </select>
        </label>
        <div>
          <span className="label">Format</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button className="btn-secondary !border-teal !bg-teal/5 !text-teal">
              <FileSpreadsheet size={14} />
              CSV
            </button>
            <button className="btn-secondary">
              <FileCheck2 size={14} />
              PDF
            </button>
          </div>
        </div>
        <label className="block">
          <span className="label">Frequency</span>
          <select
            className="control mt-1 w-full"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option>Download once</option>
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
          </select>
        </label>
        <div className="rounded-md bg-slate-50 p-3 text-[10px] leading-4 text-slate-500">
          The report retains the current site, project, shift and status
          filters. It includes generated time, data source and only the
          signed-in partner’s permission scope.
        </div>
        <button
          className="btn-primary w-full"
          onClick={() => {
            showToast(
              frequency === "Download once"
                ? "Report prepared"
                : "Report scheduled",
              frequency === "Download once"
                ? "The filtered report is ready for download."
                : `${frequency} delivery configured for Partner owner.`,
            );
            onClose();
          }}
        >
          {frequency === "Download once" ? (
            <Download size={14} />
          ) : (
            <CalendarDays size={14} />
          )}{" "}
          {frequency === "Download once"
            ? "Generate report"
            : "Schedule report"}
        </button>
      </div>
    </Modal>
  );
}

function ProfileDrawer({
  onClose,
  showToast,
}: {
  onClose: () => void;
  showToast: (title: string, detail: string) => void;
}) {
  const [tab, setTab] = useState("Profile");
  const [locale, setLocale] = useState("English");
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [rules, setRules] = useState<Record<string, boolean>>({
    "Critical operations": true,
    "Quality corrections": true,
    "Daily operations digest": true,
    "Payment changes": true,
  });
  const notificationRules = [
    {
      title: "Critical operations",
      channel: "In-app + WhatsApp",
      frequency: "Immediate",
    },
    {
      title: "Quality corrections",
      channel: "In-app + email",
      frequency: "Immediate",
    },
    {
      title: "Daily operations digest",
      channel: "Email",
      frequency: "18:30 IST",
    },
    {
      title: "Payment changes",
      channel: "In-app + email",
      frequency: "As changed",
    },
  ];
  return (
    <Drawer
      title="Profile & settings"
      eyebrow="Sarthak Workforce Solutions"
      onClose={onClose}
      width="max-w-2xl"
    >
      <TabStrip
        tabs={["Profile", "Notifications", "Preferences"]}
        active={tab}
        onChange={setTab}
      />
      {tab === "Profile" ? (
        <div className="p-5">
          <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
            <span className="grid h-12 w-12 place-items-center rounded-lg bg-navy text-sm font-semibold text-white">
              AM
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-navy">Aarav Mehta</h3>
              <p className="mt-1 text-xs text-slate-500">Partner owner</p>
            </div>
            <StatusPill>Active</StatusPill>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-xs sm:grid-cols-2">
            <div className="bg-white p-4">
              <dt className="eyebrow">Organisation</dt>
              <dd className="mt-2 break-all font-medium text-navy">
                Sarthak Workforce Solutions
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className="eyebrow">Site access</dt>
              <dd className="mt-2 font-medium text-navy">All 6 sites</dd>
            </div>
            <div className="bg-white p-4">
              <dt className="eyebrow">Email</dt>
              <dd className="mt-2 font-medium text-navy">
                aarav@sarthakworkforce.in
              </dd>
            </div>
            <div className="bg-white p-4">
              <dt className="eyebrow">Phone</dt>
              <dd className="mt-2 font-medium text-navy">+91 98••• ••421</dd>
            </div>
          </dl>
          <button
            className="btn-secondary mt-4"
            onClick={() =>
              showToast(
                "Profile editor opened",
                "Contact and account fields are ready to update.",
              )
            }
          >
            <UserRoundCog size={14} />
            Edit profile
          </button>
        </div>
      ) : null}
      {tab === "Notifications" ? (
        <div className="p-5">
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {notificationRules.map((rule) => (
              <div
                key={rule.title}
                className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 border-b border-slate-100 p-4 last:border-b-0 sm:flex sm:gap-4"
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={rules[rule.title]}
                  aria-label={`${rule.title} notifications`}
                  onClick={() =>
                    setRules((current) => ({
                      ...current,
                      [rule.title]: !current[rule.title],
                    }))
                  }
                  className={`relative h-5 w-9 shrink-0 rounded-full transition ${rules[rule.title] ? "bg-teal" : "bg-slate-300"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${rules[rule.title] ? "left-[18px]" : "left-0.5"}`}
                  />
                </button>
                <p className="min-w-0 flex-1 text-xs font-semibold text-navy">
                  {rule.title}
                </p>
                <div className="col-start-2 text-left sm:text-right">
                  <p className="text-[10px] font-medium text-slate-700">
                    {rule.channel}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-400">
                    {rule.frequency}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Quiet hours start</span>
              <select className="control mt-1 w-full">
                <option>21:00</option>
                <option>22:00</option>
                <option>Disabled</option>
              </select>
            </label>
            <label>
              <span className="label">Quiet hours end</span>
              <select className="control mt-1 w-full">
                <option>07:00</option>
                <option>08:00</option>
              </select>
            </label>
          </div>
        </div>
      ) : null}
      {tab === "Preferences" ? (
        <div className="p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label>
              <span className="label">Language</span>
              <select
                className="control mt-1 w-full"
                value={locale}
                onChange={(event) => {
                  setLocale(event.target.value);
                  showToast(
                    "Language updated",
                    `${event.target.value} selected.`,
                  );
                }}
              >
                <option>English</option>
                <option>हिन्दी</option>
                <option>தமிழ்</option>
              </select>
            </label>
            <label>
              <span className="label">Time display</span>
              <select className="control mt-1 w-full">
                <option>IST · Asia/Kolkata</option>
                <option>Device local time</option>
              </select>
            </label>
          </div>
          <button
            onClick={() => setLowBandwidth((value) => !value)}
            className="mt-4 flex w-full items-center gap-3 rounded-lg border border-slate-200 p-4 text-left"
          >
            <span
              role="switch"
              aria-checked={lowBandwidth}
              className={`relative h-5 w-9 shrink-0 rounded-full ${lowBandwidth ? "bg-teal" : "bg-slate-300"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${lowBandwidth ? "left-[18px]" : "left-0.5"}`}
              />
            </span>
            <span className="text-xs font-semibold text-navy">
              Low-bandwidth mode
            </span>
          </button>
        </div>
      ) : null}
    </Drawer>
  );
}

function NotificationsDrawer({
  actions,
  onClose,
  onAction,
}: {
  actions: ActionItem[];
  onClose: () => void;
  onAction: (action: ActionItem) => void;
}) {
  return (
    <Drawer
      title="Notifications"
      eyebrow="Role-matched · Partner owner"
      onClose={onClose}
    >
      <div className="divide-y divide-slate-100">
        {actions
          .filter((a) => a.state !== "Resolved")
          .slice(0, 5)
          .map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onClose();
                onAction(action);
              }}
              className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50"
            >
              <span
                className={`mt-1 h-2 w-2 rounded-full ${action.severity === "Critical" ? "bg-critical" : action.severity === "High" ? "bg-red-400" : "bg-amber"}`}
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-navy">
                  {action.title}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {siteName(action.siteId)} · {action.age} ago
                </p>
              </div>
              <ChevronRight size={14} className="mt-1 text-slate-300" />
            </button>
          ))}
      </div>
      <div className="m-4 rounded-md bg-slate-50 p-3 text-[10px] text-slate-500">
        Quiet hours 21:00–07:00 IST. Critical hardware and live-operations
        alerts bypass quiet hours.
      </div>
    </Drawer>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("Sites");
  const [filters, setFilters] = useState<Filters>({
    date: "Today · 03 Sep",
    project: "All projects",
    site: "All sites",
    shift: "All shifts",
    status: "All statuses",
  });
  const [actions, setActions] = useState(initialActions);
  const [issues, setIssues] = useState(issueData);
  const [invoiceRows] = useState(invoiceData);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<QualityIssue | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<
    (typeof production)[number] | null
  >(null);
  const [selectedInvoice, setSelectedInvoice] = useState<
    (typeof invoiceData)[number] | null
  >(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [showStates, setShowStates] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const filteredSites = useMemo(
    () =>
      sites.filter(
        (site) =>
          (filters.project === "All projects" ||
            site.project === filters.project) &&
          (filters.site === "All sites" || site.id === filters.site) &&
          (filters.status === "All statuses" ||
            site.status === filters.status) &&
          (filters.shift === "All shifts" ||
            filters.shift === "Shift A" ||
            (filters.shift === "Shift B" && site.shifts >= 2) ||
            (filters.shift === "Shift C" && site.shifts >= 3)),
      ),
    [filters.project, filters.site, filters.status, filters.shift],
  );
  const showToast = (title: string, detail: string) => {
    setToast({ title, detail });
    window.setTimeout(() => setToast(null), 3200);
  };
  const navigate = (target: Page) => {
    setPage(target);
    setShowCommand(false);
    setShowMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const refresh = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      showToast(
        "Data refreshed",
        "Mock source timestamps updated to 15:12 IST.",
      );
    }, 750);
  };
  const updateAction = (id: string, state: ActionItem["state"]) => {
    setActions((current) =>
      current.map((a) => (a.id === id ? { ...a, state } : a)),
    );
    setSelectedAction((current) =>
      current?.id === id ? { ...current, state } : current,
    );
  };
  const updateIssue = (id: string, state: QualityIssue["state"]) => {
    setIssues((current) =>
      current.map((i) => (i.id === id ? { ...i, state } : i)),
    );
    setSelectedIssue((current) =>
      current?.id === id ? { ...current, state } : current,
    );
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowCommand((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const overlayOpen = Boolean(
      selectedSite ||
        selectedPerson ||
        selectedAction ||
        selectedIssue ||
        selectedAsset ||
        selectedRecord ||
        selectedInvoice ||
        showStates ||
        showReport ||
        showNotifications ||
        showProfile ||
        showFilters ||
        showCommand ||
        showMobileMenu,
    );
    const previousOverflow = document.body.style.overflow;
    if (overlayOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [
    selectedSite,
    selectedPerson,
    selectedAction,
    selectedIssue,
    selectedAsset,
    selectedRecord,
    selectedInvoice,
    showStates,
    showReport,
    showNotifications,
    showProfile,
    showFilters,
    showCommand,
    showMobileMenu,
  ]);

  const pageNode = loading ? (
    <SkeletonPage />
  ) : page === "Home" ? (
    <HomePage
      filteredSites={filteredSites}
      actions={actions}
      dateScope={filters.date}
      onSite={setSelectedSite}
      onAction={setSelectedAction}
      onPage={navigate}
      onReport={() => setShowReport(true)}
    />
  ) : page === "Sites" ? (
    <SitesPage
      filteredSites={filteredSites}
      onSite={setSelectedSite}
      showToast={showToast}
    />
  ) : page === "People" ? (
    <PeoplePage
      filteredSites={filteredSites}
      onPerson={setSelectedPerson}
      showToast={showToast}
    />
  ) : page === "Live Operations" ? (
    <LiveOperationsPage
      filteredSites={filteredSites}
      onSite={setSelectedSite}
      showToast={showToast}
    />
  ) : page === "Production" ? (
    <ProductionPage
      filteredSites={filteredSites}
      onRecord={setSelectedRecord}
      showToast={showToast}
    />
  ) : page === "Quality" ? (
    <QualityPage
      filteredSites={filteredSites}
      issues={issues}
      onIssue={setSelectedIssue}
      showToast={showToast}
    />
  ) : page === "Hardware" ? (
    <HardwarePage
      filteredSites={filteredSites}
      onAsset={setSelectedAsset}
      showToast={showToast}
    />
  ) : page === "Payments" ? (
    <PaymentsPage
      filteredSites={filteredSites}
      invoices={invoiceRows}
      onInvoice={setSelectedInvoice}
      showToast={showToast}
    />
  ) : (
    <HelpPage showToast={showToast} />
  );

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[70] rounded-md bg-white px-3 py-2 text-xs font-semibold text-navy shadow-drawer focus:not-sr-only"
      >
        Skip to content
      </a>
      <Sidebar
        page={page}
        onPage={navigate}
        onProfile={() => setShowProfile(true)}
        collapsed={collapsed}
        onCollapse={() => setCollapsed((v) => !v)}
      />
      <div
        className={`${collapsed ? "lg:pl-[72px]" : "lg:pl-[218px]"} transition-[padding] duration-200`}
      >
        <Topbar
          filters={filters}
          onCommand={() => setShowCommand(true)}
          onFilters={() => setShowFilters(true)}
          onRefresh={refresh}
          onNotifications={() => setShowNotifications(true)}
          onStates={() => setShowStates(true)}
          onProfile={() => setShowProfile(true)}
        />
        <main
          id="main-content"
          className="mx-auto max-w-[1580px] px-3 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-4 lg:p-5 lg:pb-8"
        >
          {pageNode}
        </main>
      </div>
      <nav
        className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 backdrop-blur lg:hidden"
        aria-label="Mobile navigation"
      >
        {mobileNav.map(({ label, shortLabel, icon: Icon }) => (
          <button
            key={label}
            onClick={() => navigate(label)}
            aria-current={page === label ? "page" : undefined}
            className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition active:bg-slate-100 ${page === label ? "text-teal" : "text-slate-500"}`}
          >
            {page === label ? (
              <span className="absolute top-0 h-0.5 w-7 rounded-full bg-teal" />
            ) : null}
            <Icon size={19} strokeWidth={page === label ? 2.2 : 1.8} />
            <span>{shortLabel}</span>
          </button>
        ))}
        <button
          onClick={() => setShowMobileMenu(true)}
          aria-expanded={showMobileMenu}
          className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10px] font-medium transition active:bg-slate-100 ${mobileMoreGroups.some((group) => group.items.includes(page)) ? "text-teal" : "text-slate-500"}`}
        >
          {mobileMoreGroups.some((group) => group.items.includes(page)) ? (
            <span className="absolute top-0 h-0.5 w-7 rounded-full bg-teal" />
          ) : null}
          <Menu size={19} />
          <span>More</span>
        </button>
      </nav>
      {showMobileMenu ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-navy/25 lg:hidden"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setShowMobileMenu(false);
          }}
        >
          <div className="max-h-[82dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl border border-slate-200 bg-white pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-drawer page-enter">
            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-slate-200" />
            <div className="sticky top-0 mb-1 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur">
              <div>
                <p className="text-base font-semibold text-navy">More</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  All partner tools
                </p>
              </div>
              <button
                className="btn-ghost !h-11 !w-11 !p-0"
                onClick={() => setShowMobileMenu(false)}
                aria-label="Close more menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4 px-3">
              {mobileMoreGroups.map((group) => (
                <section key={group.label}>
                  <p className="eyebrow px-2 py-2">{group.label}</p>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {group.items.map((label) => {
                      const item = navItems.find(
                        (entry) => entry.label === label,
                      )!;
                      const Icon = item.icon;
                      return (
                        <button
                          key={label}
                          onClick={() => {
                            navigate(label);
                            setShowMobileMenu(false);
                          }}
                          className={`flex min-h-12 w-full items-center gap-3 border-b border-slate-100 px-3.5 text-sm font-medium last:border-b-0 ${page === label ? "bg-teal/[0.06] text-teal" : "text-slate-700 active:bg-slate-50"}`}
                        >
                          <span
                            className={`grid h-9 w-9 place-items-center rounded-lg ${page === label ? "bg-teal text-white" : "bg-slate-100 text-slate-500"}`}
                          >
                            <Icon size={18} />
                          </span>
                          <span className="flex-1 text-left">
                            {item.navigationLabel ?? label}
                          </span>
                          {item.alert ? (
                            <span className="rounded-full bg-critical/10 px-2 py-0.5 font-mono text-[10px] text-critical">
                              {item.alert}
                            </span>
                          ) : null}
                          <ChevronRight size={16} className="text-slate-300" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  setShowProfile(true);
                }}
                className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-slate-200 px-3.5 text-sm font-medium text-slate-700 active:bg-slate-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy text-white">
                  <UserRoundCog size={18} />
                </span>
                <span className="flex-1 text-left">Profile & settings</span>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {selectedSite ? (
        <SiteDrawer
          site={selectedSite}
          actions={actions}
          issues={issues}
          onClose={() => setSelectedSite(null)}
          onPerson={setSelectedPerson}
          onAsset={setSelectedAsset}
          onRecord={setSelectedRecord}
          onIssue={setSelectedIssue}
          onAction={setSelectedAction}
          showToast={showToast}
        />
      ) : null}
      {selectedPerson ? (
        <PersonDrawer
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          showToast={showToast}
        />
      ) : null}
      {selectedAction ? (
        <ActionDrawer
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onUpdate={updateAction}
          showToast={showToast}
        />
      ) : null}
      {selectedIssue ? (
        <QualityDrawer
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onUpdate={updateIssue}
          showToast={showToast}
        />
      ) : null}
      {selectedAsset ? (
        <AssetDrawer
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          showToast={showToast}
        />
      ) : null}
      {selectedRecord ? (
        <RecordDrawer
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          showToast={showToast}
        />
      ) : null}
      {selectedInvoice ? (
        <InvoiceDrawer
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          showToast={showToast}
        />
      ) : null}
      {showStates ? (
        <SystemStatesModal onClose={() => setShowStates(false)} />
      ) : null}
      {showReport ? (
        <ReportModal
          onClose={() => setShowReport(false)}
          showToast={showToast}
        />
      ) : null}
      {showNotifications ? (
        <NotificationsDrawer
          actions={actions}
          onClose={() => setShowNotifications(false)}
          onAction={setSelectedAction}
        />
      ) : null}
      {showProfile ? (
        <ProfileDrawer
          onClose={() => setShowProfile(false)}
          showToast={showToast}
        />
      ) : null}
      {showFilters ? (
        <FilterModal
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      ) : null}
      {showCommand ? (
        <CommandPalette
          onClose={() => setShowCommand(false)}
          onPage={navigate}
          onSite={setSelectedSite}
          onPerson={setSelectedPerson}
          onAsset={setSelectedAsset}
          onAction={setSelectedAction}
        />
      ) : null}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-drawer page-enter md:bottom-5"
        >
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-green/10 p-1.5 text-green">
              <CheckCircle2 size={16} />
            </span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-navy">{toast.title}</p>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                {toast.detail}
              </p>
            </div>
            <button onClick={() => setToast(null)} className="text-slate-400">
              <X size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
