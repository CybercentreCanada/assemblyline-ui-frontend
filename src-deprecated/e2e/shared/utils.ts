type Success<T> = { data: T; error: null };
type Failure<E> = { data: null; error: E };
type Result<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as E };
  }
}

export async function tryCatchRace<T, E = Error>(promises: Promise<T>[]): Promise<Result<T, E>> {
  try {
    const data = await Promise.race(promises);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as E };
  }
}
