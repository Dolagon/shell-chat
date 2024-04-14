import { FormInst, FormRules } from 'naive-ui';

export type DeviceType = 'desktop' | 'mobile';

export type ThemeType = 'light' | 'dark';

export type ChatRoleType = 'user' | 'assistant';

export type GptModel = 'gpt-3.5-turbo' | 'gpt-4-turbo-preview';

export interface OptionsItem {
  label: string;
  value: string;
}

export interface FormState<TForm = {}, TLoad extends string | number = 'submit', TEvents = Record<string | number, () => void>> {
  form: TForm;
  loadingState: Record<TLoad, boolean>;
  formRef?: FormInst | null;
  options?: OptionsItem[];
  show?: boolean;
  title?: string;
  rules?: FormRules;
  cancelText?: string;
  confirmText?: string;
  width?: string;
  state?: string | number;
  events?: TEvents;
}
