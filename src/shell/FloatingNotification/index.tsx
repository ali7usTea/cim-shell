import { Phone, PhoneOff, MessageCircle } from "lucide-react";

export interface IncomingInteraction {
  id: string;
  channel: "voice" | "whatsapp" | "chat";
  from: string;
  customerName?: string;
}

interface FloatingNotificationProps {
  interaction: IncomingInteraction | null;
  onAccept: () => void;
  onDismiss: () => void;
}

/**
 * A new Genesys interaction can arrive while the agent is deep in an MFE on
 * a different search tab. This surfaces it as a floating, dismissible
 * notification rather than stealing focus — accepting it is what triggers
 * step 4/5 of the flow (Genesys -> Shell search request -> new Search
 * Context + tab).
 */
export function FloatingNotification({ interaction, onAccept, onDismiss }: FloatingNotificationProps) {
  if (!interaction) return null;

  const ChannelIcon = interaction.channel === "chat" ? MessageCircle : Phone;

  return (
    <div className="pointer-events-auto fixed bottom-6 right-16 z-50 w-80 rounded-xl border border-shell-border bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <ChannelIcon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">Incoming {interaction.channel}</p>
          <p className="truncate text-xs text-slate-500">
            {interaction.customerName ?? interaction.from}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-shell-border px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
        >
          <PhoneOff size={14} />
        </button>
      </div>
    </div>
  );
}
