import { Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import 'reflect-metadata';
import { convertToDate } from '../utils/convert_to_date';

export class StrategModel {
  @Expose({ name: 'id' }) id: string = '';
  @Expose() slug: string = '';
  @Expose() title: string = '';
  @Expose() body: string = '';
  @Expose() status: string = '';
  @Expose() image: string = '';
  @Expose() isFree: boolean = true;

  @Expose() @Type(() => Date) strategDate?: Date | null = null;
  @Expose() @Type(() => Date) strategTime?: Date | null = null;
  @Expose() @Type(() => Date) strategDateTime?: Date | null = null;
  @Expose() @Type(() => Date) timestampCreated?: Date | null = null;
  @Expose() @Type(() => Date) timestampUpdated?: Date | null = null;

  static fromJson(json: any): StrategModel {
    json = convertObjectDate(json);
    return plainToInstance(StrategModel, json, { exposeDefaultValues: true, excludeExtraneousValues: true });
  }

  static toJson(order: StrategModel): any {
    return instanceToPlain(order);
  }
}

function convertObjectDate(json: any) {
  json.timestampCreated = convertToDate(json.timestampCreated) || new Date();
  json.timestampUpdated = convertToDate(json.timestampUpdated) || new Date();
  json.strategDate = convertToDate(json.strategDate) || new Date();
  json.strategTime = convertToDate(json.strategTime) || new Date();
  json.strategDateTime = convertToDate(json.strategDateTime) || new Date();

  return json;
}
