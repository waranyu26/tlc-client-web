import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import ThirdParty from 'supertokens-web-js/recipe/thirdparty';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';
import EmailVerification from 'supertokens-web-js/recipe/emailverification';

import axiosInstance from 'src/lib/axios';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// SuperTokens frontend SDK init. Recipes: EmailPassword + ThirdParty (Google)
// + EmailVerification + Session.
// `Session.addAxiosInterceptors` gives silent access-token refresh on 401 (FR4).
// ----------------------------------------------------------------------

let initialized = false;

export function initSuperTokens() {
  if (initialized) return;
  initialized = true;

  SuperTokens.init({
    appInfo: {
      appName: CONFIG.appName,
      apiDomain: CONFIG.supertokens.apiDomain,
      apiBasePath: CONFIG.supertokens.apiBasePath,
    },
    // EmailVerification is initialised here even though the backend runs the
    // recipe in OPTIONAL mode: the SDK is what reads the token out of the
    // verification link and posts it, and the recipe has to exist client-side
    // for that call to have anywhere to go.
    recipeList: [
      Session.init(),
      EmailPassword.init(),
      ThirdParty.init(),
      EmailVerification.init(),
    ],
  });

  Session.addAxiosInterceptors(axiosInstance);
}
