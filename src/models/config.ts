import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class RepoConfig {
  @IsString()
  @IsDefined()
  public readonly repoLink: string;

  @IsString()
  @IsDefined()
  public readonly repoName: string;

  @IsString()
  @IsOptional()
  public readonly dockerfile?: string;

  @IsString()
  @IsOptional()
  public readonly dockerCompose?: string;

  @IsNumber()
  @IsDefined()
  public readonly port: number;

  constructor(repoLink: string, repoName: string, port: number) {
    this.repoLink = repoLink;
    this.repoName = repoName;
    this.port = port;
  }
}

export class Config {
  @Type((type) => RepoConfig)
  @IsDefined()
  @ValidateNested({ each: true })
  public readonly repos: RepoConfig[];

  @IsString()
  @IsDefined()
  public readonly hostname: string;

  @IsBoolean()
  @IsDefined()
  public readonly ssl = false;

  @IsString()
  @IsOptional()
  public readonly sslCertificate?: string;

  @IsString()
  @IsOptional()
  public readonly sslKey?: string;

  constructor(repos: RepoConfig[], hostname: string) {
    this.repos = repos;
    this.hostname = hostname;
  }
}
