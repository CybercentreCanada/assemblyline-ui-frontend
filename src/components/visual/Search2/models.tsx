import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import NumbersOutlinedIcon from '@mui/icons-material/NumbersOutlined';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';

export type Index = 'submission' | 'file' | 'result' | 'signature' | 'alert' | 'retrohunt';

export type FieldType = 'boolean' | 'date' | 'float' | 'integer' | 'keyword' | 'object' | 'text';

export type Field = {
  default?: boolean;
  indexed?: boolean;
  list?: boolean;
  stored?: boolean;
  type?: FieldType;
};

export const FIELD_COLORS: Record<
  FieldType,
  'primary' | 'success' | 'default' | 'secondary' | 'error' | 'info' | 'warning'
> = {
  boolean: 'info',
  date: 'success',
  float: 'warning',
  integer: 'error',
  keyword: 'error',
  object: 'error',
  text: 'error'
};

export const FIELDS: {
  [type: string]: {
    color: 'primary' | 'success' | 'default' | 'secondary' | 'error' | 'info' | 'warning';
    icon: React.ReactElement;
  };
} = {
  boolean: {
    color: 'warning',
    icon: <RadioButtonCheckedOutlinedIcon fontSize="inherit" />
  },
  date: {
    color: 'info',
    icon: <CalendarMonthOutlinedIcon fontSize="inherit" />
  },
  float: {
    color: 'success',
    icon: <NumbersOutlinedIcon fontSize="inherit" />
  },
  integer: {
    color: 'success',
    icon: <NumbersOutlinedIcon fontSize="inherit" />
  },
  keyword: {
    color: 'primary',
    icon: <TextFieldsOutlinedIcon fontSize="inherit" />
  },
  object: {
    color: 'secondary',
    icon: <DataObjectOutlinedIcon fontSize="inherit" />
  },
  text: {
    color: 'primary',
    icon: <TextFieldsOutlinedIcon fontSize="inherit" />
  }
};
