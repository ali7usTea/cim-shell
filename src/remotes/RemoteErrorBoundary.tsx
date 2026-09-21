import { Component, type ReactNode } from 'react';
import { MfeUnavailable } from './MfeUnavailable';

interface Props {
    mfeLabel: string;
    onRetry: () => void;
    children: ReactNode;
}

interface State {
    error: Error | null;
}

/**
 * Catches render/lifecycle errors thrown *after* a remote module has loaded successfuly - separate failure mode from "couldn't fethc the "
 * remote at all", which RemoteMfeLoader handles before this boundary is even reached.
 * Without this, one MFE's bug can crash the whole Shell tab tree, taking every other open search context down with it.
 */
export class RemoteErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: { componentStack: string }) {
        // Route into your loaggin pipeline (winston/dd-trace) bridge per Observability goverrnance item.
        // Tagged with which MFE failed so it's traceable back to the owning team.
        console.error(`[MFE:${this.props.mfeLabel}] render error`, error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <MfeUnavailable
                    mfeLabel={this.props.mfeLabel}
                    reason='runtime-error'
                    onRetry={() => {
                        this.setState({ error: null });
                        this.props.onRetry();
                    }}
                    debugDetail={this.state.error.message}
                />
            );
        }
        return this.props.children;
    }
}