declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ORGANIZATION_ID: string
      PROJECT_ID: string
      OPENAI_API_KEY: string
      AZURE_STORAGE_ACCOUNT_NAME: string
      AZURE_STORAGE_CONTAINER_NAME: string
      AZURE_STORAGE_ACCOUNT_KEY: string
    }
  }
}
