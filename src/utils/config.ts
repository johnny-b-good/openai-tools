import "dotenv/config";
import z from "zod";

const envSchema = z.object({
  VERBOSE: z.stringbool(),

  OPENAI_MODEL: z.string().min(1),
  OPENAI_BASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),

  WORKING_DIRECTORY: z.string().min(1),
  PYTHON_DOCKER_IMAGE_TAG: z.string().min(1),
  TAVILY_API_KEY: z.string().min(1),
  PROXY_URL: z.string().min(1),

  FETCH_FILE_STORAGE_PATH: z.string().min(1),
  FETCH_BROWSER_TYPE: z.enum(["chrome", "firefox"]),
  FETCH_BROWSER_BIN_PATH: z.string().min(1),
  FETCH_BROWSER_DATA_PATH: z.string().min(1),
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
