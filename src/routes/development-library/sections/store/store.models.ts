/** State shared by the store demos, deliberately nested to mirror how the app's stores are shaped. */
export type StoreDemoState = {
  /** Account related values. */
  account: {
    /** Identity related values. */
    identity: {
      /** Family related values. */
      family: {
        /** Details about the family. */
        details: {
          /** Last name, nested four levels deep. */
          last: string;
        };
      };
    };
    /** Profile related values. */
    profile: {
      /** Name related values. */
      name: {
        /** First name, nested three levels deep. */
        first: string;
      };
    };
  };
  /** Settings related values. */
  settings: {
    /** Options related values. */
    options: {
      /** Consent related values. */
      consent: {
        /** Whether consent is given, nested three levels deep. */
        checked: boolean;
      };
    };
  };
};

export const DEFAULT_STORE_DEMO_STATE: StoreDemoState = {
  account: {
    identity: { family: { details: { last: '' } } },
    profile: { name: { first: '' } }
  },
  settings: { options: { consent: { checked: false } } }
};
