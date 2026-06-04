import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";

export function asyncHandler<
    P = ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery = Query,
>(
    handler: (
        req: Request<P, ResBody, ReqBody, ReqQuery>,
        res: Response<ResBody>,
        next: NextFunction,
    ) => Promise<unknown>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
    return (req, res, next): void => {
        void (handler(req, res, next).catch(next));
    };
}
