// Ambient type declarations for modules without official TypeScript types
// This file is automatically loaded by TypeScript due to its naming convention

declare module 'otplib' {
  export interface GenerateSecretOptions {
    name?: string;
    issuer?: string;
    length?: number;
  }

  export interface GenerateSecretResult {
    secret: string;
    otpauth_url: string;
  }

  export function generateSecret(options?: GenerateSecretOptions): GenerateSecretResult;

  export class TOTP {
    constructor(options?: { secret?: string; window?: number; step?: number });
    generate(): string;
    verify(options: { token: string; secret: string }): boolean;
    check(token: string): boolean;
  }

  export const authenticator: {
    generateSecret(options?: GenerateSecretOptions): GenerateSecretResult;
    generate(secret: string): string;
    verify(options: { token: string; secret: string }): boolean;
    check(secret: string, token: string): boolean;
  };
}

declare module '@marsidev/react-turnstile' {
  import { FC } from 'react';

  export interface TurnstileProps {
    siteKey: string;
    onSuccess?: (token: string) => void;
    onError?: (error: any) => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
    options?: {
      theme?: 'light' | 'dark' | 'auto';
      size?: 'normal' | 'compact';
      responseFieldName?: string;
      [key: string]: any;
    };
  }

  export const Turnstile: FC<TurnstileProps>;
}

declare module '@azure/storage-blob' {
  export class BlobServiceClient {
    static fromConnectionString(connectionString: string): BlobServiceClient;
    getContainerClient(containerName: string): ContainerClient;
  }

  export class ContainerClient {
    exists(): Promise<boolean>;
    create(): Promise<any>;
    getBlockBlobClient(blobName: string): BlockBlobClient;
  }

  export interface UploadFileOptions {
    overwrite?: boolean;
    tags?: Record<string, string>;
    [key: string]: any;
  }

  export class BlockBlobClient {
    uploadFile(filePath: string, options?: UploadFileOptions): Promise<any>;
    download(): Promise<any>;
  }
}

declare module '@upstash/redis' {
  export class Redis {
    static fromEnv(): Redis;
    constructor(options: { url: string; token: string });
    get<T = any>(key: string): Promise<T | null>;
    set(key: string, value: any, options?: { ex?: number }): Promise<any>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<any>;
    ttl(key: string): Promise<number>;
    del(key: string): Promise<any>;
  }
}

declare module 'pino-roll' {
  import { TransportTargetOptions } from 'pino';
  
  export interface PinoRollOptions {
    file?: string;
    size?: string | number;
    maxBackups?: number;
    frequency?: 'daily' | 'hourly';
  }

  const pinoRoll: TransportTargetOptions;
  export default pinoRoll;
}
