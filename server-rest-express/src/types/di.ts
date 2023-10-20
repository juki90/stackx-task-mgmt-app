import path from 'path';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import jsonwebtoken from 'jsonwebtoken';
import * as sequelizeTypescript from 'sequelize-typescript';

import type { Sequelize } from 'sequelize';

type Bcrypt = typeof bcrypt;
type PlatformFs = typeof fs;
type PlatformPath = typeof path;
type SequelizeTypescript = typeof sequelizeTypescript;
type JsonWebToken = typeof jsonwebtoken;

export type {
    Bcrypt,
    Sequelize,
    PlatformFs,
    JsonWebToken,
    PlatformPath,
    SequelizeTypescript
};
