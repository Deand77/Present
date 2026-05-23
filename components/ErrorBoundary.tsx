"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (typeof console !== "undefined") {
      console.error("[Present] render error:", error);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="border border-red-300 bg-red-50 text-red-900 rounded-lg p-6 my-6">
        <h2 className="font-semibold mb-2">Something broke while rendering.</h2>
        <p className="text-sm mb-3">
          {this.state.error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={this.reset}
          className="text-sm border border-red-700 text-red-700 px-3 py-1.5 rounded hover:bg-red-700 hover:text-white transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }
}
