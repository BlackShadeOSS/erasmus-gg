"use client";

import {
    useEffect,
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
} from "react";

interface TurnstileProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
}

export interface TurnstileRef {
    reset: () => void;
}

declare global {
    interface Window {
        turnstile: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    "error-callback"?: () => void;
                    "expired-callback"?: () => void;
                    theme?: "light" | "dark";
                    size?: "normal" | "compact";
                }
            ) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
    }
}

// Global state to track script loading
let scriptLoaded = false;
let scriptLoading = false;
const scriptLoadCallbacks: (() => void)[] = [];

const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
    { onVerify, onError, onExpire },
    ref
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | undefined>(undefined);
    const callbacksRef = useRef({ onVerify, onError, onExpire });
    const mountedRef = useRef(true);
    const [isReady, setIsReady] = useState(false);

    // Expose reset method to parent
    useImperativeHandle(ref, () => ({
        reset: () => {
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.reset(widgetIdRef.current);
                } catch (error) {
                    console.error("Failed to reset Turnstile:", error);
                }
            }
        },
    }));

    // Update callbacks ref when props change
    callbacksRef.current = { onVerify, onError, onExpire };

    useEffect(() => {
        mountedRef.current = true;

        const initializeTurnstile = () => {
            if (
                !mountedRef.current ||
                !containerRef.current ||
                widgetIdRef.current
            )
                return;

            if (window.turnstile) {
                try {
                    // Clear any existing content
                    containerRef.current.innerHTML = "";

                    // Render the widget
                    widgetIdRef.current = window.turnstile.render(
                        containerRef.current,
                        {
                            sitekey:
                                process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
                            callback: (token: string) => {
                                if (mountedRef.current) {
                                    callbacksRef.current.onVerify(token);
                                }
                            },
                            "error-callback": () => {
                                if (mountedRef.current) {
                                    callbacksRef.current.onError?.();
                                }
                            },
                            "expired-callback": () => {
                                if (mountedRef.current) {
                                    callbacksRef.current.onExpire?.();
                                }
                            },
                            theme: "dark",
                            size: "normal",
                        }
                    );

                    if (mountedRef.current) {
                        setIsReady(true);
                    }
                } catch (error) {
                    console.error("Failed to render Turnstile:", error);
                }
            }
        };

        const loadScript = () => {
            if (scriptLoaded) {
                initializeTurnstile();
                return;
            }

            if (scriptLoading) {
                scriptLoadCallbacks.push(initializeTurnstile);
                return;
            }

            // Check if script already exists
            const existingScript = document.querySelector(
                'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
            );

            if (existingScript) {
                if (window.turnstile) {
                    scriptLoaded = true;
                    initializeTurnstile();
                } else {
                    scriptLoading = true;
                    const handleLoad = () => {
                        scriptLoaded = true;
                        scriptLoading = false;
                        existingScript.removeEventListener("load", handleLoad);

                        // Execute all pending callbacks
                        scriptLoadCallbacks.forEach((callback) => callback());
                        scriptLoadCallbacks.length = 0;

                        if (mountedRef.current) {
                            initializeTurnstile();
                        }
                    };
                    existingScript.addEventListener("load", handleLoad);
                }
            } else {
                scriptLoading = true;
                const script = document.createElement("script");
                script.src =
                    "https://challenges.cloudflare.com/turnstile/v0/api.js";
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    scriptLoaded = true;
                    scriptLoading = false;

                    // Execute all pending callbacks
                    scriptLoadCallbacks.forEach((callback) => callback());
                    scriptLoadCallbacks.length = 0;

                    if (mountedRef.current) {
                        initializeTurnstile();
                    }
                };
                script.onerror = () => {
                    scriptLoading = false;
                    console.error("Failed to load Turnstile script");
                };
                document.head.appendChild(script);
            }
        };

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(loadScript, 100);

        return () => {
            clearTimeout(timeoutId);
            mountedRef.current = false;

            // Clean up the widget
            if (widgetIdRef.current && window.turnstile) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch (e) {
                    // Fallback to reset if remove fails
                    try {
                        window.turnstile.reset(widgetIdRef.current);
                    } catch (resetError) {
                        // Ignore cleanup errors
                    }
                }
            }
            widgetIdRef.current = undefined;
            setIsReady(false);
        };
    }, []);

    return (
        <div className="flex justify-center">
            <div
                ref={containerRef}
                className={`transition-opacity duration-300 ${
                    isReady ? "opacity-100" : "opacity-0"
                }`}
            />
            {!isReady && (
                <div className="h-16 w-64 bg-neutral-700 rounded-md animate-pulse flex items-center justify-center">
                    <span className="text-neutral-400 text-sm">
                        Ładowanie captcha...
                    </span>
                </div>
            )}
        </div>
    );
});

export default Turnstile;
