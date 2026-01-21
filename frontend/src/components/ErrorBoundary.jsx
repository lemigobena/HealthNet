import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center space-y-6">
                    <div className="h-24 w-24 bg-destructive/10 rounded-full flex items-center justify-center text-destructive mb-4">
                        <AlertCircle className="h-12 w-12" />
                    </div>
                    <div className="space-y-2 max-w-md">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Something went wrong</h1>
                        <p className="text-muted-foreground font-medium">
                            An unexpected error occurred. Our team has been notified.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-4 p-4 bg-muted/50 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-destructive">
                                {this.state.error.toString()}
                                <br />
                                {this.state.errorInfo?.componentStack}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={this.handleReload} size="lg" className="font-bold">
                            <RefreshCw className="mr-2 h-4 w-4" /> Reload Application
                        </Button>
                        <Button variant="outline" size="lg" onClick={() => window.location.href = '/'}>
                            Return Home
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
