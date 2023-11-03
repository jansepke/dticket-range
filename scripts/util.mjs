export const collect = async (iterator) => {
  const items = [];
  for await (const item of iterator) {
    items.push(item);
  }
  return items;
};

export const parallel = async (workerCount, data, workFunction) => {
  async function doWork(iterator) {
    for (const [index, item] of iterator) {
      await workFunction(index, item);
    }
  }

  const workers = Array(workerCount).fill(data.entries()).map(doWork);

  return await Promise.allSettled(workers);
};

export const unique = (items) => [...new Set(items)];

export const logProgress = (tag, index, max) => {
  if (index % 100 === 0) {
    console.log(tag, index, "/", max);
  }
};
