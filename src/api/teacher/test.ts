import { Model } from 'mongoose';

export class TestService {
  constructor(private model: Model<{ id: number; name: string }>) {}

  test() {
    const filter: Record<string, any> = {};
    return this.model.find(filter);
  }
}
