import type { ReactNode } from "react";

export type MfeFailureReason = 'not-deployed' | 'timeout' | 'runtime-error';

interface Props {
    mfeLabel: string;
    reason: MfeFailureReason;
    onRetry: () => void;
    /** Optional extra detail shown to engineers, e.g. in a collapsed <details>. */
    debugDetail?: ReactNode;
}

const COPY: Record<MfeFailureReason, { title: string; body: string }> = {
    'not-deployed': {
        title: 'This capability isn\u2019t available right now',
        body: 'It may not be deployed yet, or the service is temporarily down. You can keep working in your other tabs.',
    },
    timeout: {
        title: 'This is taking longer than expected',
        body: 'The sevice didn\n2019t respond in time. It may be under leavy load - try again in a moment.',
    },
    'runtime-error': {
        title: 'Something went wrong loading this',
        body: 'This capability hit an error after loading. Retrying may resolve it; if it keeps happening, report it',
    },
};

export function MfeUnavailable({ mfeLabel, reason, onRetry, debugDetail }: Props) {
    const { title, body } = COPY[reason];
    const isError = reason === 'runtime-error';

    return (
        <div
            className={`rounded-lg border p-6 ${isError ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                }`}
            role='alert'
        >
            <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold uppercase ${isError ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {mfeLabel} unavailable
                </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-600">{body}</p>
            <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
                Retry
            </button>
            {debugDetail ? (
                <details className="mt-3 text-xs text-gray-400">
                    <summary className="cursor-pointer">
                        Details
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap">
                        {debugDetail}
                    </pre>
                </details>
            ) : null}
        </div>
    );
}