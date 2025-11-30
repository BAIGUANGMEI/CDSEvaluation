// src/router.js
import { corsOptions, errorResponse } from './utils';

export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    // Convert path to regex (simple implementation)
    // e.g. /api/courses/(\d+) -> ^/api/courses/(\d+)$
    // If path is string without regex chars, escape it? 
    // For simplicity, let's assume the input path is already a regex string if it contains special chars
    // or we can just treat it as regex string.
    
    // If the path doesn't start with ^, add it.
    let patternStr = path;
    if (!patternStr.startsWith('^')) {
        patternStr = '^' + patternStr;
    }
    if (!patternStr.endsWith('$')) {
        patternStr = patternStr + '$';
    }

    this.routes.push({
      method,
      pattern: new RegExp(patternStr),
      handler
    });
  }

  get(path, handler) {
    this.add("GET", path, handler);
  }

  post(path, handler) {
    this.add("POST", path, handler);
  }

  async handle(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return corsOptions();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    for (const route of this.routes) {
      if (route.method === request.method) {
        const match = path.match(route.pattern);
        if (match) {
            // match[0] is the full match, match[1...] are groups
            const args = match.slice(1); 
            return await route.handler(request, env, ctx, ...args);
        }
      }
    }

    return errorResponse("Not Found", 404);
  }
}
