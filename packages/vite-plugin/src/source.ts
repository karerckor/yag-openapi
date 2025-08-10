import { watch as fsWatch, readFile } from 'fs';

export type SchemaMap = Record<string, any>;
export type SchemaUpdateCallback = (schema: string) => void;

export type Source = (cb: SchemaUpdateCallback, abort: AbortController) => () => void;

export function remote(
    endpoint: string,
    options?: {
        pollingInterval?: number,
        headers?: Record<string, string>,
        customFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>
    },
): Source {
    const {
        pollingInterval = 30_000,
        headers = {},
        customFetch = fetch
    } = options || {};

    return (cb: SchemaUpdateCallback, abort: AbortController) => {
        let timer: NodeJS.Timeout | null = null;

        const fetchSchema = async () => {
            if (abort.signal.aborted) return;
            try {
                const res = await customFetch(endpoint, { headers });
                if (!res.ok) throw new Error(`Failed to fetch schema: ${res.statusText}`);
                const schema = await res.text();
                cb(schema);
            } catch (e) {
                if (!abort.signal.aborted) {
                    const msg = e instanceof Error ? e.message : String(e);
                    console.error(`[yag-openapi] Failed to fetch OpenAPI schema from ${endpoint}.\n  • Reason: ${msg}\n  • Tips: Check the URL, CORS, and network connectivity. You can set custom headers or a custom fetch in the source config.`);
                }
            }
            if (!abort.signal.aborted) {
                timer = setTimeout(fetchSchema, pollingInterval);
            }
        };

        fetchSchema();

        return () => {
            if (timer) clearTimeout(timer);
            abort.abort();
        };
    };
}

export function file(path: string, options: { watch?: boolean } = {}): Source {
    const { watch = false } = options;

    return (cb: SchemaUpdateCallback, abort: AbortController) => {
        let watcher: ReturnType<typeof fsWatch> | null = null;

        const readAndUpdate = () => {
            readFile(path, 'utf-8', (err, data) => {
                if (abort.signal.aborted) return;
                if (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    console.error(`[yag-openapi] Could not read OpenAPI schema file at ${path}.\n  • Reason: ${msg}\n  • Tips: Ensure the path is correct relative to your Vite project root and the file is accessible.`);
                    return;
                }
                cb(data);
            });
        };

        readAndUpdate();

        if (watch) {
            try {
                watcher = fsWatch(path, (event) => {
                    if (!abort.signal.aborted && (event === 'change' || event === 'rename')) {
                        // 'rename' can happen when editors do atomic writes; re-read either way
                        readAndUpdate();
                    }
                });
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                console.error(`[yag-openapi] Failed to start file watcher for ${path}.\n  • Reason: ${msg}\n  • Tips: Make sure the file exists before watching and the path is valid.`);
            }
        }

        return () => {
            abort.abort();
            if (watcher) watcher.close();
        };
    };
}
