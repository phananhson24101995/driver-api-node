import { Connection, Schema, Model, Document } from 'mongoose';

export interface AutoIncrementOptions {
  inc_field: string;
  id: string;
}

export interface CounterDocument extends Document<string> {
  seq: number;
}

export function AutoIncrementPlugin(
  schema: Schema,
  options: AutoIncrementOptions,
  connection: Connection,
) {
  const { inc_field, id } = options;

  let CounterModel: Model<CounterDocument>;
  try {
    CounterModel = connection.model<CounterDocument>('Counter');
  } catch {
    const CounterSchema = new Schema({
      _id: { type: String, required: true },
      seq: { type: Number, default: 0 },
    });
    CounterModel = connection.model<CounterDocument>(
      'Counter',
      CounterSchema,
      'counters',
    );
  }

  schema.pre('save', async function (this: Document) {
    // Chỉ tăng bộ đếm khi tạo mới document
    if (!this.isNew) {
      return;
    }

    const counter = await CounterModel.findByIdAndUpdate(
      id,
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true },
    ).exec();
    // Gán giá trị sequence vào trường được chỉ định (mặc định là id)
    if (counter) {
      this.set(inc_field, counter.seq);
    }
  });
}
