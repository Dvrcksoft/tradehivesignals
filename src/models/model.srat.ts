import { Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import 'reflect-metadata';
import { convertToDate } from '../utils/convert_to_date';

export class SratModel {
  @Expose({ name: 'id' }) id: string = '';
  @Expose() slug: string = '';
  @Expose() title: string = '';
  @Expose() body: string = '';
  @Expose() status: string = '';
  @Expose() image: string = '';
  @Expose() isFree: boolean = true;

  @Expose() @Type(() => Date) sratDate?: Date | null = null;
  @Expose() @Type(() => Date) sratTime?: Date | null = null;
  @Expose() @Type(() => Date) sratDateTime?: Date | null = null;
  @Expose() @Type(() => Date) timestampCreated?: Date | null = null;
  @Expose() @Type(() => Date) timestampUpdated?: Date | null = null;

  static fromJson(json: any): SratModel {
    json = convertObjectDate(json);
    return plainToInstance(SratModel, json, { exposeDefaultValues: true, excludeExtraneousValues: true });
  }

  static toJson(order: SratModel): any {
    return instanceToPlain(order);
  }
}

function convertObjectDate(json: any) {
  json.timestampCreated = convertToDate(json.timestampCreated) || new Date();
  json.timestampUpdated = convertToDate(json.timestampUpdated) || new Date();
  json.sratDate = convertToDate(json.sratDate) || new Date();
  json.sratTime = convertToDate(json.sratTime) || new Date();
  json.sratDateTime = convertToDate(json.sratDateTime) || new Date();

  return json;
}
