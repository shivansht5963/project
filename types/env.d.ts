declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_OPENAI_API_KEY: string;
      EXPO_PUBLIC_API_URL: string;
    }
  }
}

export {};