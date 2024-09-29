import type { TranslationsReference } from '@org/i18n';

import type { DataType as Reference } from '../en-001/common';

enum Data {
  welcome = 'Добро пожаловать!',
}

export default Data;

export type DataType = typeof Data;

({}) as DataType satisfies TranslationsReference<Reference>;
