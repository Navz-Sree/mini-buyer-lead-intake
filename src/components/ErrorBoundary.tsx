"use client";
import React, { Component } from "react";

type ErrorBoundaryProps = React.PropsWithChildren<object>;
type ErrorBoundaryState = { hasError: boolean; error: unknown };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }
  componentDidCatch() {
    // You can log error here if needed
  }
  render() {
    if (this.state.hasError) {
      let message = "An unexpected error occurred.";
      if (this.state.error && typeof this.state.error === "object" && "message" in this.state.error) {
        message = (this.state.error as { message?: string }).message || message;
      }
      return (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          <div className="font-bold mb-2">Something went wrong.</div>
          <div className="text-sm">{message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
