import Flow from '@flowjs/flow.js';
import { createFormContext } from 'components/core/form/createFormContext';
import type { HashPatternMap } from 'components/models/base/config';
import type { Metadata } from 'components/models/base/submission';
import type { ProfileSettings } from 'components/routes/settings/settings.utils';
import generateUUID from 'helpers/uuid';

export type SubmitState = {
  hash: string;
  c12n: string;
  metadata?: Metadata;
};

export type SubmitMetadata = {
  data: { [key: string]: unknown };
  edit: string;
};

export const FLOW = new Flow({
  target: '/api/v4/ui/flowjs/',
  permanentErrors: [412, 500, 501],
  maxChunkRetries: 1,
  chunkRetryInterval: 500,
  simultaneousUploads: 4
});

export type SubmitStore = {
  /** State related to the interface of the Submit page */
  state: {
    /** adjust the service selection and parameters */
    adjust: boolean;

    /** Is the confirmation dialog open? */
    confirmation: boolean;

    /** The user is able to customize the values */
    customize: boolean;

    /** disable the inputs */
    disabled: boolean;

    /** Are the settings currently being fetched? */
    isFetchingSettings: boolean;

    /** loading the settings */
    loading: boolean;

    /** Selected profile for the submission */
    profile: string;

    /** Type of submission being made */
    tab: 'file' | 'hash';

    /** Is a submission being sent? */
    uploading: boolean;

    /** Upload progress of a file submission */
    uploadProgress: number;

    /** UUID of the submission */
    uuid: string;
  };

  /** Details of the file input  */
  file: File & { relativePath: string; fileName: string; path: string; hash: string };

  /** Details of the hash input */
  hash: { type: HashPatternMap; value: string };

  /** Selected metadata of the submission */
  metadata: SubmitMetadata;

  /** All the user's settings */
  settings: ProfileSettings;
};

export const DEFAULT_SUBMIT_FORM: SubmitStore = Object.freeze({
  state: {
    adjust: true,
    confirmation: false,
    customize: false,
    disabled: false,
    isFetchingSettings: true,
    loading: true,
    profile: null,
    tab: 'file' as const,
    uploading: false,
    uploadProgress: 0,
    uuid: generateUUID()
  },
  file: null,
  hash: {
    type: 'url' as const,
    value: 'https://www.google.ca' as const
  },
  metadata: {
    edit: null,
    data: {
      body: 'false',
      classification: 'PB//CND',
      collection_type: 'EMAIL',
      cpoints: '["H5:01"]',
      department: 'Public Services and Procurement Canada',
      direction: 'INTERNAL',
      eml_path:
        'CBS_EMAIL://2025/03/12/eml/cbs/11/27/OPS-1-14_92_H5_01_20250312111937_27c41cb0-9b50-423d-a126-e6127a00f96a.eml.cart',
      from: 'EMDM.Prod1.NoReply-AucuneReponse.GAME@SSC-SPC.gc.ca',
      from_alias: 'EMDM.Prod1.NoReply-AucuneReponse.GAME@SSC-SPC.gc.ca',
      id: 'CBS_EMAIL_32376334316362302d396235302d343233642d613132362d653631323761303066393661',
      ingest_id: 'DqTPvBQNeBD542XxvGXtX',
      last_received_ip_country_code: 'us',
      last_received_ip_v6: '2603:10b6:c01:83::27',
      message_id: '1798159079.61.1741778371360@msa.emrs.services.global.gc.ca',
      ministerial_authorization: 'MA (HBS) for PSPC (2024/05/14) [collected]',
      protocol: 'SMTP',
      received:
        '["from YQZPR01CA0099.CANPRD01.PROD.OUTLOOK.COM (2603:10b6:c01:83::27) by YQBPR0101MB6444.CANPRD01.PROD.OUTLOOK.COM (2603:10b6:c01:4b::5) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.8511.28; Wed, 12 Mar 2025 11:19:33 +0000", "from QB1PEPF00004E0D.CANPRD01.PROD.OUTLOOK.COM (2603:10b6:c01:83:cafe::dc) by YQZPR01CA0099.outlook.office365.com (2603:10b6:c01:83::27) with Microsoft SMTP Server (version=TLS1_3, cipher=TLS_AES_256_GCM_SHA384) id 15.20.8511.27 via Frontend Transport; Wed, 12 Mar 2025 11:19:33 +0000", "from mail.tpsgc-pwgsc.gc.ca (198.103.167.20) by QB1PEPF00004E0D.mail.protection.outlook.com (10.167.240.5) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256) id 15.20.8534.20 via Frontend Transport; Wed, 12 Mar 2025 11:19:32 +0000", "from PSPC-MB-07.ad.pwgsc-tpsgc.gc.ca (10.1.4.136) by PSPC-HYB-01.ad.pwgsc-tpsgc.gc.ca (10.1.0.42) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256) id 15.1.2507.39; Wed, 12 Mar 2025 07:19:32 -0400", "from PSPC-MH-01.ad.pwgsc-tpsgc.gc.ca (10.1.5.33) by PSPC-MB-07.ad.pwgsc-tpsgc.gc.ca (10.1.4.136) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256) id 15.1.2507.39; Wed, 12 Mar 2025 07:19:32 -0400", "from mx.ssan.egs-seg.gc.ca (142.226.8.4) by mailhub.tpsgc-pwgsc.gc.ca (10.1.5.31) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256) id 15.1.2507.39 via Frontend Transport; Wed, 12 Mar 2025 07:19:32 -0400", "from mx51.canada.ca (mx51.canada.ca [205.193.216.166]) by mx.ssan.egs-seg.gc.ca with ESMTP id 52CBJWM5027449-52CBJWM7027449 (version=TLSv1.2 cipher=ECDHE-RSA-AES256-GCM-SHA384 bits=256 verify=OK) for <Gregory.Romain@tpsgc-pwgsc.gc.ca>; Wed, 12 Mar 2025 07:19:32 -0400"]',
      reply_to: '["EMDM.Prod1.NoReply-AucuneReponse.GAME@SSC-SPC.gc.ca"]',
      reply_to_alias: '["EMDM.Prod1.NoReply-AucuneReponse.GAME@SSC-SPC.gc.ca"]',
      sensor: 'CBS',
      source_id: '27c41cb0-9b50-423d-a126-e6127a00f96a',
      stream_id: '92',
      subject:
        'Password to activate your device for the EMDM service / Mot de passe servant \u00e0 activer votre appareil pour le service GAME',
      tag: '2025-03-12T11:19:37_EMDM.Prod1.NoReply-AucuneReponse.GAME@SSC-SPC.gc.ca_PasswordtoactivateyourdevicefortheEMDMservice/Motdepasseservant\u00e0activervotreappareilpourleserviceGAME',
      time: '2025-03-12T11:19:37.279131Z',
      to: '["Gregory.Romain@tpsgc-pwgsc.gc.ca"]',
      ts: '2025-03-12T11:19:37.518395Z',
      type: 'CBS',
      urls: '["https://www.gcpedia.gc.ca/wiki/GAME_Support", "https://www.gcpedia.gc.ca/wiki/Mobile_Services_-_Activating_Your_Device", "https://www.gcpedia.gc.ca/wiki/Services_Mobile_-_Activer_votre_appareil", "https://www.gcpedia.gc.ca/wiki/EMDM_SUPPORT"]',
      workload: 'Microsoft.O365.Journal.EmlAttachment',
      x_originating_ip_country_code: 'us',
      x_originating_ip_v6: '2603:10b6:c01:83::27'
    }
  },
  settings: null
});

export const { FormProvider, useForm } = createFormContext<SubmitStore>({
  defaultValues: structuredClone(DEFAULT_SUBMIT_FORM)
});
