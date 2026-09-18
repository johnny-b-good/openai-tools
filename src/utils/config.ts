import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  VERBOSE: z.stringbool(),

  OPENAI_MODEL: z.string().min(1),
  OPENAI_BASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),

  WORKING_DIRECTORY: z.string().min(1),
  EXTRA_SYSTEM_PROMPT: z.string().min(1),
  PYTHON_DOCKER_IMAGE_TAG: z.string().min(1),
  TAVILY_API_KEY: z.string().min(1),
  PROXY_URL: z.string().min(1),

  FETCH_FILE_STORAGE_PATH: z.string().min(1),
  FETCH_BROWSER_TYPE: z.enum(["chrome", "firefox"]),
  FETCH_BROWSER_BIN_PATH: z.string().min(1),
  FETCH_BROWSER_DATA_PATH: z.string().min(1),

  NOTIFICATION_APP_NAME: z.string().min(1),
  NOTIFICATION_APP_DESKTOP_ENTRY: z.string().min(1),
  NOTIFICATION_TIMEOUT: z.string().min(1),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.stringbool(),

  IMAP_HOST: z.string().min(1),
  IMAP_PORT: z.coerce.number(),
  IMAP_SECURE: z.stringbool(),

  USER_NAME: z.string().min(1),
  PASSWORD: z.string().min(1),

  SENDER_NAME: z.string().min(1),
  SENDER_EMAIL: z.string().min(1),

  LAST_MESSAGES_NUM: z.coerce.number(),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error(
    "Error: invalid environment variables:\n",
    z.prettifyError(result.error),
  );
  process.exit(1);
}

export const config = result.data;
