export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `FirestorePermissionError: Missing or insufficient permissions at [${context.path}] during [${context.operation}].`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is for Next.js and other environments to show a useful stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }
}
