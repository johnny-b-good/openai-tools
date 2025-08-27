/**
 * Chunk a string into overlapping pieces.
 *
 * The function is agnostic to the underlying tokenisation.  By default
 * it works on raw UTF‑16 code units (i.e. “characters”), but you can
 * provide a custom `splitFn` that returns an array of “tokens”.
 *
 * The API mirrors the most common RAG patterns:
 *   • `chunkSize`      – the target length of a chunk (in tokens or characters)
 *   • `chunkOverlap`   – how many tokens/characters the neighbouring chunks share
 *
 * Example usage
 * --------------
 * ```ts
 * const text = "Lorem ipsum dolor sit amet…";
 * const chunks = chunkText(text, { chunkSize: 200, chunkOverlap: 40 });
 * console.log(chunks.length);   // e.g. 5
 * console.log(chunks[0]);       // first 200 chars
 * console.log(chunks[1]);       // chars 160‑360 (200 + 40 overlap)
 * ```
 *
 * @param text The raw text that will be split.
 * @param options Configuration options:
 *   - `chunkSize`:   Target chunk length (tokens/characters).  Defaults to 1000.
 *   - `chunkOverlap`: How many units should overlap. Defaults to 200.
 *   - `splitFn`: Optional custom tokenizer that returns an array of tokens.
 *                If omitted, the default is a simple `Array.from(str)` which
 *                splits by Unicode code points.
 *
 * @returns An array of string chunks.
 */
export interface ChunkOptions {
  /** Target length of each chunk. */
  chunkSize?: number;
  /** How many tokens/characters the next chunk should overlap with the previous one. */
  chunkOverlap?: number;
  /**
   * Optional custom tokenizer.
   * It must return an array of tokens (e.g. words, characters, or model tokens).
   * The default implementation splits by Unicode code point so that every
   * grapheme cluster is treated as a separate “token”.
   */
  splitFn?: (s: string) => string[];
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { chunkSize = 1000, chunkOverlap = 200, splitFn } = options;

  if (chunkSize <= 0) {
    throw new Error("chunkSize must be a positive integer");
  }
  // Prevent infinite loops when overlap >= size
  const overlap = Math.min(chunkOverlap, chunkSize - 1);

  // 1️⃣ Tokenise the whole string once – this keeps the split logic
  //    deterministic and fast.  If you are feeding a language‑model
  //    tokenizer you can replace this with the real tokeniser.
  const tokens = splitFn ? splitFn(text) : Array.from(text);

  const chunks: string[] = [];
  let i = 0; // token index

  while (i < tokens.length) {
    const end = Math.min(i + chunkSize, tokens.length);
    const chunkTokens = tokens.slice(i, end);
    chunks.push(chunkTokens.join("")); // join back into a string

    // move forward, leaving `overlap` tokens for the next chunk
    i += chunkSize - overlap;
  }

  return chunks;
}
