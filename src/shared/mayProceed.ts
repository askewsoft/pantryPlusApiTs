import { logger } from "./logger";
import { dbPost, extractDbResult } from "./dbDriver";
import { ErrorCode } from "./errorHandler";
import getFileName from "./getFileName";

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
  if (!results) {
    log.error(`${getFileName(accessTemplate)}: results is undefined`);
    return false;
  }
  if (results && !Array.isArray(results)) {
    log.error(`${getFileName(accessTemplate)}: results is not an array`);
    return false;
  }
  if (results.length === 0) {
    log.debug(`${getFileName(accessTemplate)}: no results`);
    return false;
  }
  if (results[0].allowed === undefined) {
    log.debug(`${getFileName(accessTemplate)}: allowed is undefined`);
    return false;
  }
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
      log.warn(`user ${email} not allowed access via ${getFileName(accessTemplate)}`);
      const err = new Error('user not allowed access');
      err.name = ErrorCode.NO_ACCESS;
      throw err;
    }
  }
  return;
};