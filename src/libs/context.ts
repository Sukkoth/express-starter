import { AsyncLocalStorage } from 'async_hooks';
type RequestContext = { requestId: string };
export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();
