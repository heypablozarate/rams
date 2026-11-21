import source from '../../tokens.json';
import { resolveTokens } from '../lib/token-resolver';

export const tokens = resolveTokens(source);
