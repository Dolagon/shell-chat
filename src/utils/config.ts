export const TOKEN_KEY = 'shell-chat-token';

export const WIDTH = 992;

export const USERNAME_LIMIT = 13;

export const PWD_LIMIT = 20;

export const MAX_CONTEXT_NUM = -12;

export const BASE_URL = import.meta.env.VITE_APP_BASE_API;

export const IMG_BASE_URL = import.meta.env.VITE_APP_IMG_BASE_URL;

export const GPT_MODEL_MAP = {
  'gpt-3.5-turbo': {
    consume: 1,
    title: 'ChatGpt 3.5'
  },
  'gpt-4-turbo-preview': {
    consume: 2,
    title: 'ChatGpt 4'
  }
};
