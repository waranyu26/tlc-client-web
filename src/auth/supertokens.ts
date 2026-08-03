import SuperTokens from 'supertokens-web-js';
import Session from 'supertokens-web-js/recipe/session';
import ThirdParty from 'supertokens-web-js/recipe/thirdparty';
import EmailPassword from 'supertokens-web-js/recipe/emailpassword';

import axiosInstance from 'src/lib/axios';
import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------
// SuperTokens frontend SDK init. Recipes: EmailPassword + ThirdParty (Google) + Session.
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
    recipeList: [Session.init(), EmailPassword.init(), ThirdParty.init()],
  });

  Session.addAxiosInterceptors(axiosInstance);
}
