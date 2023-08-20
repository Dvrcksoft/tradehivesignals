import { Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import 'reflect-metadata';
import { convertToDate } from '../utils/convert_to_date';

export class AnalModel {
  @Expose({ name: 'id' }) id: string = '';
  @Expose() slug: string = '';
  @Expose() title: string = '';
  @Expose() body: string = '';
  @Expose() status: string = '';
  @Expose() image: string = '';
  @Expose() isFree: boolean = true;

  @Expose() @Type(() => Date) analDate?: Date | null = null;
  @Expose() @Type(() => Date) analTime?: Date | null = null;
  @Expose() @Type(() => Date) analDateTime?: Date | null = null;
  @Expose() @Type(() => Date) timestampCreated?: Date | null = null;
  @Expose() @Type(() => Date) timestampUpdated?: Date | null = null;

  static fromJson(json: any): AnalModel {
    json = convertObjectDate(json);
    return plainToInstance(AnalModel, json, { exposeDefaultValues: true, excludeExtraneousValues: true });
  }

  static toJson(order: AnalModel): any {
    return instanceToPlain(order);
  }
}

function convertObjectDate(json: any) {
  json.timestampCreated = convertToDate(json.timestampCreated) || new Date();
  json.timestampUpdated = convertToDate(json.timestampUpdated) || new Date();
  json.analDate = convertToDate(json.analDate) || new Date();
  json.analTime = convertToDate(json.analTime) || new Date();
  json.analDateTime = convertToDate(json.analDateTime) || new Date();

  return json;
}
