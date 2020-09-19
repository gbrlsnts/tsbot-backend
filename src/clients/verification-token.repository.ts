import { EntityRepository, Repository } from 'typeorm';
import { VerificationToken } from './verification-token.entity';

@EntityRepository(VerificationToken)
export class VerificationTokenRepository extends Repository<
  VerificationToken
> {}
