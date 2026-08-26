import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

/** Runs after express-validator checks; returns 400 with details if any failed. */
export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }
  next();
}
