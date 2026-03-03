// Type declarations for modules without official TypeScript types

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

declare module 'otplib' {
  export function generateSecret(): string;

  export class TOTP {
    constructor(options?: { secret?: string; window?: number; step?: number });
    generate(secret: string): string;
    verify(options: { token: string; secret: string }): boolean;
    check(token: string, secret: string): boolean;
  }

  export const authenticator: {
    generateSecret(): string;
    generate(secret: string): string;
    verify(options: { token: string; secret: string }): boolean;
  };
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

  export class BlockBlobClient {
    uploadFile(filePath: string): Promise<any>;
    download(): Promise<any>;
  }
}

declare module '@upstash/redis' {
  export class Redis {
    static fromEnv(): Redis;
    constructor(options: { url: string; token: string });
    get(key: string): Promise<any>;
    set(key: string, value: any, options?: { ex?: number }): Promise<any>;
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<any>;
    ttl(key: string): Promise<number>;
  }
}
