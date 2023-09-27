import path from 'path';
import { promises as fs } from 'fs';
import * as sequelizeTypescript from 'sequelize-typescript';

import type { Sequelize } from 'sequelize-typescript';

type PlatformFs = typeof fs;

type PlatformPath = typeof path;

type SequelizeTypescript = typeof sequelizeTypescript;

export type { Sequelize, PlatformFs, PlatformPath, SequelizeTypescript };
