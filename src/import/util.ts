export const parallel = async <T>(
  workerCount: number,
  data: T[],
  workFunction: (index: number, item: T) => Promise<void>,
) => {
  async function doWork(iterator: IterableIterator<[number, T]>) {
    for (const [index, item] of iterator) {
      await workFunction(index, item);
    }
  }

  const workers = Array(workerCount).fill(data.entries()).map(doWork);

  return await Promise.allSettled(workers);
};

export const unique = <T>(items: T[]) => [...new Set(items)];

export const logProgress = (tag: string, index: number, max: number) => {
  if (index % 100 === 0) {
    console.log(tag, index, "/", max);
  }
};
