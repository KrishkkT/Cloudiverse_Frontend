import { useEffect } from "react";

export default function CaptchaGate({ onVerified }) {
    useEffect(() => {
        // Load Turnstile script once
        if (!document.getElementById("cf-turnstile-script")) {
            const script = document.createElement("script");
            script.id = "cf-turnstile-script";
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        }

        // Callback Cloudflare calls after success
        window.onTurnstileSuccess = function (token) {
            onVerified(token);
        };
    }, [onVerified]);

    return (
        <div className="fixed inset-0 bg-[#262835] flex items-center justify-center z-[9999] font-sans text-[#333]">
            <div className="w-full max-w-[400px] p-6">
                <div className="mb-6">
                    <h2 className="text-2xl text-white font-medium mb-2">Verify you are human</h2>
                    <p className="text-base text-white">
                        Verifying you are human. This may take a few seconds.
                    </p>
                </div>

                <div className="flex justify-center mb-6 bg-white p-4 rounded border border-gray-200 shadow-sm">
                    <div
                        className="cf-turnstile"
                        data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                        data-callback="onTurnstileSuccess"
                        data-theme="light"
                    ></div>
                </div>

                <div className="text-xs text-gray-400 mt-8 text-center">
                    <span className="block mb-1">{import.meta.env.VITE_APP_NAME || "Cloudiverse"} needs to review the security of your connection.</span>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <span>Ray ID: <span className="font-mono">{Math.random().toString(36).substring(2, 18).toUpperCase()}</span></span>
                        <span>&bull;</span>
                        <span>Performance & security by Cloudflare</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
