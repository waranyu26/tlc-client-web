import type { AuthContextValue } from '../types';

import { createContext } from 'react';

// ----------------------------------------------------------------------
// Provider-agnostic context. The concrete provider (src/auth/context/supertokens)
// is responsible for populating this value.
// ----------------------------------------------------------------------

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
