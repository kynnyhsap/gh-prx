export async function withBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > retries) throw error;
      const delayMs = Math.min(250 * 2 ** attempt, 3000) + Math.floor(Math.random() * 120);
      await Bun.sleep(delayMs);
    }
  }
}
