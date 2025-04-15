export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findOne(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
