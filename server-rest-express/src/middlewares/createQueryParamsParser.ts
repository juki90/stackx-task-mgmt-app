import { Op } from 'sequelize';

import { USER_UPDATABLE_FIELDS_NO_PASSWORD } from '@/models/User';
import { TASK_UPDATABLE_FIELDS_NO_USERSSTATUS } from '@/models/Task';

import type { Request, Response, NextFunction } from 'express';

export default (basicRouteName: 'users' | 'tasks') =>
    (req: Request, res: Response, next: NextFunction) => {
        const { query } = req;
        const queryParams: {
            limit?: number;
            offset?: number;
            order?: [string, string][];
            where?: {
                [x: string]:
                    | {
                          [y: string]: {
                              [i: string]: string;
                          };
                      }[]
                    | { [z: string]: null };
            };
        } = {};

        Object.entries(
            query as {
                [x: string]: {
                    [y: string]: string | number;
                };
            }
        ).forEach(([param, value]): void => {
            if (param === 'page') {
                const { index, size } = value as {
                    index: string;
                    size: string;
                };

                queryParams.limit = parseInt(size);
                queryParams.offset = parseInt(index) * parseInt(size);
            }

            if (param === 'filter') {
                const fields: { [x: string]: string[] } = {
                    users: USER_UPDATABLE_FIELDS_NO_PASSWORD,
                    tasks: TASK_UPDATABLE_FIELDS_NO_USERSSTATUS
                };

                const orParams: {
                    [y: string]: {
                        [i: string]: string;
                    };
                }[] = [];

                fields[basicRouteName].forEach((field: string) => {
                    orParams.push({
                        [field]: {
                            [Op.iLike]: `%${value}%`
                        }
                    });
                });

                queryParams.where = { [Op.or]: orParams };
            }
        });

        if (basicRouteName === 'users') {
            if (!queryParams.where) {
                queryParams.where = {};
            }

            queryParams.where.deletedAt = { [Op.eq]: null };
        }

        queryParams.order = [['updatedAt', 'DESC']];

        req.queryParams = queryParams;

        return next();
    };
