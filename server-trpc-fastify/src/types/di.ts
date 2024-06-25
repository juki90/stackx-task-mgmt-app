import path from 'path';
import bcrypt from 'bcryptjs';
import { promises as fs } from 'fs';
import jsonwebtoken from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type Bcrypt = typeof bcrypt;
type PlatformFs = typeof fs;
type PlatformPath = typeof path;
type JsonWebToken = typeof jsonwebtoken;
type TPrisma = typeof prisma;

export type { Bcrypt, TPrisma, PlatformFs, JsonWebToken, PlatformPath };
