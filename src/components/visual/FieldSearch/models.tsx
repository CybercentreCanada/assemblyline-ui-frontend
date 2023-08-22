import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';

export type Params = {
  index?: Index;
  field?: string;
};

export const PAGE_SIZE = 20;

export const MAX_TRACKED_RECORDS = 10000;

export const DEFAULT_PARAMS = {
  query: '*',
  offset: 0,
  rows: PAGE_SIZE,
  start: 'now-1y',
  end: 'now',
  gap: '15d',
  mincount: 0
};

export const DEFAULT_QUERY: string = Object.keys(DEFAULT_PARAMS)
  .map(k => `${k}=${DEFAULT_PARAMS[k]}`)
  .join('&');

export type Index = 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt';

export const DEFAULTS: Record<
  Index,
  {
    field: string;
    permission: string;
    sort: string;
  }
> = {
  submission: {
    field: 'classification',
    permission: 'submission_view',
    sort: 'times.submitted desc'
  },
  file: {
    field: 'type',
    permission: 'submission_view',
    sort: 'seen.last desc'
  },
  result: {
    field: 'type',
    permission: 'submission_view',
    sort: 'created desc'
  },
  signature: {
    field: 'type',
    permission: 'signature_view',
    sort: 'last_modified desc'
  },
  alert: {
    field: 'type',
    permission: 'alert_view',
    sort: 'reporting_ts desc'
  },
  retrohunt: {
    field: 'creator',
    permission: 'retrohunt_view',
    sort: 'created desc'
  }
};

export type FieldType = 'boolean' | 'date' | 'float' | 'integer' | 'ip' | 'keyword' | 'object' | 'text';

export type Field = {
  default?: boolean;
  indexed?: boolean;
  list?: boolean;
  stored?: boolean;
  type?: FieldType;

  count?: number;
  min?: number;
  max?: string;
  avg?: number;
  sum?: number;
};

export const FIELD_COLORS: Record<
  FieldType,
  'primary' | 'success' | 'default' | 'secondary' | 'error' | 'info' | 'warning'
> = {
  boolean: 'info',
  date: 'success',
  float: 'warning',
  ip: 'error',
  integer: 'error',
  keyword: 'error',
  object: 'error',
  text: 'error'
};

export const FIELDS: Record<
  string,
  {
    color: 'primary' | 'success' | 'default' | 'secondary' | 'error' | 'info' | 'warning';
    icon: React.ReactElement;
  }
> = {
  boolean: {
    color: 'warning',
    icon: <RadioButtonCheckedOutlinedIcon fontSize="inherit" color="inherit" />
  },
  date: {
    color: 'info',
    icon: <CalendarMonthOutlinedIcon fontSize="inherit" color="inherit" />
  },
  float: {
    color: 'success',
    icon: <NumbersOutlinedIcon fontSize="inherit" color="inherit" />
  },
  integer: {
    color: 'success',
    icon: <NumbersOutlinedIcon fontSize="inherit" color="inherit" />
  },
  ip: {
    color: 'error',
    icon: <LocationOnOutlinedIcon fontSize="inherit" color="inherit" />
  },
  keyword: {
    color: 'primary',
    icon: <TextFieldsOutlinedIcon fontSize="inherit" color="inherit" />
  },
  object: {
    color: 'secondary',
    icon: <DataObjectOutlinedIcon fontSize="inherit" color="inherit" />
  },
  text: {
    color: 'secondary',
    icon: <DescriptionOutlinedIcon fontSize="inherit" color="inherit" />
  }
};
