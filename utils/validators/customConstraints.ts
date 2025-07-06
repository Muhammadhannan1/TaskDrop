import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Types } from 'mongoose';

@ValidatorConstraint({ name: 'IsObjectId', async: false })
export class IsObjectIdConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    return Types.ObjectId.isValid(value); // Or `ObjectId.isValid(value)` for MongoDB driver
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Invalid ObjectId: $value';
  }
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }
}

@ValidatorConstraint({ name: 'NonPrimitiveArray' })
export class NonPrimitiveArrayConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    return (
      Array.isArray(value) &&
      value.reduce(
        (a, b) => a && typeof b === 'object' && !Array.isArray(b),
        true,
      )
    );
  }
}
