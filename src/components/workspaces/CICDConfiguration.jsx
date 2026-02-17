import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Github, Rocket, Lock, Copy, Check, Info } from 'lucide-react';

const CICDConfiguration = ({ workspaceId, initialConfig }) => {
    const [repoUrl, setRepoUrl] = useState(initialConfig?.repo_url || '');
    const [branch, setBranch] = useState(initialConfig?.ci_config?.branch || 'main');
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(initialConfig?.ci_config || null);
    const [copied, setCopied] = useState(null);

    const handleSetup = async (e) => {
        e.preventDefault();
        if (!repoUrl) return toast.error('Repository URL is required');

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ci/setup/${workspaceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ repoUrl, branch })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Setup failed');

            toast.success('CI/CD Configured Successfully!');
            setConfig({
                ...config,
                webhook_secret: data.secrets.webhook_secret,
                ci_token: data.secrets.ci_token,
                repo_full_name: repoUrl.replace('https://github.com/', ''),
                enabled: true
            });
            // Also update parent/context if possible, but local state is fine for now
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
        toast.info('Copied to clipboard');
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-6 mt-6">
            <div className="flex items-center mb-6">
                <Rocket className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-xl font-semibold text-text-primary">Continuous Deployment (CI/CD)</h2>
            </div>

            {!config?.enabled ? (
                <form onSubmit={handleSetup} className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 mb-4">
                        <h3 className="font-medium text-primary flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            Automate Your Deployments
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                            Connect your GitHub repository to automatically deploy changes when you push to a specific branch.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">GitHub Repository URL</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 h-5 w-5 text-text-secondary" />
                            <input
                                type="url"
                                placeholder="https://github.com/username/repo"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1">Branch to Watch</label>
                        <input
                            type="text"
                            placeholder="main"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Configuring...' : 'Setup CI/CD Pipeline'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center text-green-600">
                            <Check className="h-5 w-5 mr-2" />
                            <span className="font-medium">CI/CD is Enabled</span>
                        </div>
                        <button
                            onClick={() => setConfig({ ...config, enabled: false })}
                            className="text-sm text-text-secondary hover:text-text-primary underline"
                        >
                            Reconfigure
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-background rounded-lg border border-border">
                            <label className="text-xs text-text-secondary uppercase font-bold mb-2 block">Webhook Secret</label>
                            <div className="flex items-center justify-between">
                                <code className="text-sm font-mono text-primary truncate mr-2">
                                    {config.webhook_secret ? '••••••••••••••••••••••••' : 'Not Generated'}
                                </code>
                                <button onClick={() => copyToClipboard(config.webhook_secret, 'secret')} className="p-1 hover:bg-surface rounded">
                                    {copied === 'secret' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-text-secondary" />}
                                </button>
                            </div>
                            <p className="text-xs text-text-subtle mt-2">Used to verify payloads from GitHub.</p>
                        </div>

                        <div className="p-4 bg-background rounded-lg border border-border">
                            <label className="text-xs text-text-secondary uppercase font-bold mb-2 block">CI Token</label>
                            <div className="flex items-center justify-between">
                                <code className="text-sm font-mono text-primary truncate mr-2">
                                    {config.ci_token ? '••••••••••••••••••••••••' : 'Not Generated'}
                                </code>
                                <button onClick={() => copyToClipboard(config.ci_token, 'token')} className="p-1 hover:bg-surface rounded">
                                    {copied === 'token' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-text-secondary" />}
                                </button>
                            </div>
                            <p className="text-xs text-text-subtle mt-2">Use this token for manual API triggers.</p>
                        </div>
                    </div>

                    <div className="border-t border-border pt-4">
                        <h4 className="font-medium text-text-primary mb-2">Webhook URL</h4>
                        <div className="flex items-center bg-background rounded-lg border border-border px-3 py-2">
                            <code className="flex-1 text-sm font-mono text-text-secondary truncate">
                                {`${import.meta.env.VITE_API_BASE_URL}/api/ci/webhook`}
                            </code>
                            <button onClick={() => copyToClipboard(`${import.meta.env.VITE_API_BASE_URL}/api/ci/webhook`, 'url')} className="ml-2">
                                {copied === 'url' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-text-secondary" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CICDConfiguration;
