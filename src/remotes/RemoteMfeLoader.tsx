import { useEffect, useState, type ComponentType, Component } from 'react';
import { mfeRegistry, remoteSpecifier, type MfeKey } from './registry';
import { loadRemoteWithTimeout, RemoteTimeoutError } from './loadRemoteWithTimeout';
import { MfeUnavailable, type MfeFailureReason } from './MfeUnavailable';
import { RemoteErrorBoundary } from './RemoteErrorBoundary';
import type { SearchContext } from '@/types';
// import type { SearchContext } from '../search/SearchContext'; // from your existing Search Context model.

interface RemoteAppProps {
    searchContext: SearchContext;
}

type LoadState =
    | { status: 'loading' }
    | { status: 'ready'; Component: ComponentType<RemoteAppProps> }
    | { status: 'failed'; reason: MfeFailureReason; detail: string };

interface Props {
    mfeKey: MfeKey;
    searchContext: SearchContext
}

/**
 * Mounts one MFE by key. Three distinct failure modes are handled explicityly.
 * 1. not deployed / 404 / network error    -> the dynamic import() itself rejects immedialtely.
 * 2. Not responding (hanging)              -> loadRemoteWithTimeout races it against a timeout instead of handing forever.
 * 3. Loads fine, then throws during render -> caught by RemoteErrorBoundary, a separate layer from this component's own try/catch.
 */
export function RemoteMfeLoader({ mfeKey, searchContext }: Props) {
    const [state, setState] = useState<LoadState>({ status: 'loading' })
    const [attemp, setAttempt] = useState(0);
    const entry = mfeRegistry[mfeKey];

    useEffect(() => {
        let cancelled = false;
        setState({ status: 'loading' });

        loadRemoteWithTimeout(
            //@vite-ignore - the specifier is dynamic (build from te registery),
            // so Vite can't statically analyze it; federation resolves it at runtime 
            // via the remotes map in vite.config.mts.
            () => import( /* @vite-ignore */ remoteSpecifier(mfeKey)),
            mfeKey,
            8000,
        )
            .then((mod) => {
                if (cancelled) return;
                const Component = (mod as { default: ComponentType<RemoteAppProps> }).default;
                setState({ status: 'ready', Component });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                const isTimeout = err instanceof RemoteTimeoutError;
                console.error(`[MFE:${entry.label}] load failed`, err);
                setState({
                    status: 'failed',
                    reason: isTimeout ? 'timeout' : 'not-deployed',
                    detail: err instanceof Error ? err.message : String(err),
                });
            });
        return () => {
            cancelled = true;
        };
    }, [mfeKey, attemp]);

    const retry = () => setAttempt((n) => n + 1);

    if (state.status === 'loading') {
        return (
            <div className='flex h-40 items-center justify-center text-sm text-gray-400'>
                Loading {entry.label}...
            </div>
        );
    }

    if (state.status === 'failed') {
        return (
            <MfeUnavailable
                mfeLabel={entry.label}
                reason={state.reason}
                onRetry={retry}
                debugDetail={state.detail}
            />
        );
    }

    const { Component } = state;
    return (
        <RemoteErrorBoundary mfeLabel={entry.label} onRetry={retry}>
            <Component searchContext={searchContext} />
        </RemoteErrorBoundary>
    )

}