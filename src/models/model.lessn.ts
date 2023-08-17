import { Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import 'reflect-metadata';
import { convertToDate } from '../utils/convert_to_date';

export class LessnModel {
  @Expose({ name: 'id' }) id: string = '';
  @Expose() slug: string = '';
  @Expose() title: string = '';
  @Expose() body: string = '';
  @Expose() status: string = '';
  @Expose() image: string = '';
  @Expose() isFree: boolean = true;

  @Expose() @Type(() => Date) lessnDate?: Date | null = null;
  @Expose() @Type(() => Date) lessnTime?: Date | null = null;
  @Expose() @Type(() => Date) lessnDateTime?: Date | null = null;
  @Expose() @Type(() => Date) timestampCreated?: Date | null = null;
  @Expose() @Type(() => Date) timestampUpdated?: Date | null = null;

  static fromJson(json: any): LessnModel {
    json = convertObjectDate(json);
    return plainToInstance(LessnModel, json, { exposeDefaultValues: true, excludeExtraneousValues: true });
  }

  static toJson(order: LessnModel): any {
    return instanceToPlain(order);
  }
}

function convertObjectDate(json: any) {
  json.timestampCreated = convertToDate(json.timestampCreated) || new Date();
  json.timestampUpdated = convertToDate(json.timestampUpdated) || new Date();
  json.lessnDate = convertToDate(json.lessnDate) || new Date();
  json.lessnTime = convertToDate(json.lessnTime) || new Date();
  json.lessnDateTime = convertToDate(json.lessnDateTime) || new Date();

  return json;
}
