import { logger } from "./logger";
import { dbPost, extractDbResult } from "./dbDriver";
import { ErrorCode } from "./errorHandler";

const log = logger("Shared");

export interface AccessParams {
  /** name of the SQL template to use for access checking */
  accessTemplate: string;
  /** email of the user */
  email: string;
  /** ID of the object for which access is being checked */
  id: string;
};

export const hasAccess = async ({ accessTemplate, email, id }: AccessParams): Promise<boolean> => {
  const [rows, fields] = await dbPost(accessTemplate, { email, id });
  const results = extractDbResult(rows);
  const allowed = Boolean(results[0].allowed);
  return allowed;
};

export const mayProceed = async ({ accessTemplate, email, id }: AccessParams): Promise<void> => {
  if (!email) {
    const err = new Error('missing user identity');
    err.name = ErrorCode.MISSING_IDENTITY;
    throw err;
  }

  // confirm access
  if (accessTemplate && id) {
    const access = await hasAccess({ accessTemplate, email, id });
    if (!access) {
      log.warn(`user ${email} not allowed access via ${accessTemplate}`);
      const err = new Error('user not allowed access');
      err.name = ErrorCode.NO_ACCESS;
      throw err;
    }
  }
  return;
};