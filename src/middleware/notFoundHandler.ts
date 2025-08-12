import { Request, Response } from "express";

/**
 * 404 Not Found handler middleware
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).send({
    message: "Not Found",
  });
}
