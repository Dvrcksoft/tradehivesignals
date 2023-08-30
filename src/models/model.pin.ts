import { Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import 'reflect-metadata';
import { convertToDate } from '../utils/convert_to_date';

export class PinModel {
  @Expose({ name: 'id' }) id: string = '';
  @Expose() title: string = '';
  @Expose() body: string = '';
  @Expose() link: string = '';
  @Expose() image: string = '';
  @Expose() @Type(() => Date) timestampCreated?: Date | null = null;
  @Expose() @Type(() => Date) timestampUpdated?: Date | null = null;

  static fromJson(json: any): PinModel {
    json = convertObjectDate(json);
    return plainToInstance(PinModel, json, { exposeDefaultValues: true, excludeExtraneousValues: true });
  }

  static toJson(order: PinModel): any {
    return instanceToPlain(order);
  }
}

function convertObjectDate(json: any) {
  json.timestampCreated = convertToDate(json.timestampCreated) || new Date();
  json.timestampUpdated = convertToDate(json.timestampUpdated) || new Date();

  return json;
}
