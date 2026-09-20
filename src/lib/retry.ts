/** 실패하면 잠깐 쉬었다가 다시 시도한다 — 로그인 직후처럼 세션이 막 갱신된
 *  시점에 첫 조회가 일시적으로 실패하는 경우, 사용자에게 에러를 바로 보여주는
 *  대신 로딩 상태를 유지한 채 조용히 재시도한다. */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 500
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}
