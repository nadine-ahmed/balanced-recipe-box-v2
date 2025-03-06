"use client"

import React from "react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">
            {this.state.error
              ? this.state.error.message || "An unexpected error occurred"
              : "An unknown error occurred"}
          </p>
          {this.state.error && this.state.error.stack && (
            <pre className="mb-4 text-left text-sm text-gray-500 overflow-auto max-h-64 bg-gray-100 p-4 rounded">
              {this.state.error.stack}
            </pre>
          )}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Try again
            </button>
            <Link href="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Go back home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

