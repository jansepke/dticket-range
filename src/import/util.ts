const logProgress = (tag: string, index: number, max: number) => {
  if (index % 100 === 0) {
    console.log(tag, index, "/", max);
  }
};
export const parallel = async <T, R>(
  workerCount: number,
  data: T[],
  workFunction: (item: T) => Promise<R[]>,
  logTag: string,
): Promise<R[]> => {
  const results: R[] = [];

  async function doWork(iterator: IterableIterator<[number, T]>) {
    for (const [index, item] of iterator) {
      const d = await workFunction(item);
      results.push(...d);

      logProgress(logTag, index, data.length);
    }
  }

  const workers = Array(workerCount).fill(data.entries()).map(doWork);

  await Promise.allSettled(workers);

  return results;
};

export const unique = <T>(items: T[]) => [...new Set(items)];

export const groupBy = <T, K extends keyof any, R>(arr: T[], key: (i: T) => K, result: (i: T) => R) =>
  arr.reduce(
    (groups, item) => {
      (groups[key(item)] ||= []).push(result(item));
      return groups;
    },
    {} as Record<K, R[]>,
  );
