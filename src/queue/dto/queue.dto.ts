import { Field, ObjectType, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class QueueJob {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  data?: string;

  @Field()
  status: string;

  @Field(() => Int)
  progress: number;

  @Field(() => Int)
  attempts: number;

  @Field(() => Int)
  maxAttempts: number;

  @Field(() => Int, { nullable: true })
  delay?: number;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field()
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  processedAt?: Date;

  @Field(() => Date, { nullable: true })
  failedAt?: Date;

  @Field(() => String, { nullable: true })
  error?: string;

  // Computed fields
  @Field()
  isActive: boolean;

  @Field()
  isCompleted: boolean;

  @Field()
  isFailed: boolean;

  @Field()
  timeInQueue: string;
}

@ObjectType()
export class QueueStats {
  @Field(() => Int)
  waiting: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  failed: number;

  @Field(() => Int)
  delayed: number;

  @Field(() => Int)
  total: number;

  @Field(() => Float)
  throughput: number;

  @Field(() => Float)
  averageProcessingTime: number;
}
