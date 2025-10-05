type PutPostMetaBase<T> = {
  url: string;
  callback: (res: T) => void;
};

export type PutPostMetaOf<T, R extends boolean> = PutPostMetaBase<T> & { returnObs: R };
