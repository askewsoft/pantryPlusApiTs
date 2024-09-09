import { logger } from "./logger";
import { dbPost, extractDbResult } from "./dbDriver";
import { errEnum } from "./errorHandler";

const log = logger("Shared");

export interface AccessParams {
  accessTemplate: string;
  email: string;
  id: string;
};

export const hasAccess = async ({ accessTemplate, email, id }: AccessParams): Promise<boolean> => {
  const [rows, fields] = await dbPost(accessTemplate, { email, id });
  const results = extractDbResult(rows);
  return Boolean(results.length);
};

export const mayProceed = async ({ accessTemplate, email, id }: AccessParams): Promise<void> => {
  if (!email) {
    const err = new Error('missing user identity');
    err.name = errEnum.MISSING_IDENTITY;
    throw err;
    return;
  }

  // confirm access
  if (accessTemplate && id) {
    const access = await hasAccess({ accessTemplate, email, id });
    if (!access) {
      log.warn(`user ${email} not allowed to modify object via ${accessTemplate}`);
      const err = new Error('user not allowed access');
      err.name = errEnum.NO_ACCESS;
      throw err;
      return;
    }
  }
  return;
};