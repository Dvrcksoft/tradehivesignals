import { Expose, instanceToPlain, plainToInstance, Type } from 'class-transformer';
import 'reflect-metadata';
import { X } from 'tabler-icons-react';
import { convertToDate } from '../utils/convert_to_date';

export class AuthUserModel {
  @Expose({ name: 'id' }) id: string = '';
  @Expose() appBuildNumber: number = 0;
  @Expose() appVersion: string = '';
  @Expose() email: string = '';
  @Expose() isActive: boolean = true;
  @Expose() isNotificationEnabled: boolean = true;
  @Expose() profileImage: string = '';
  @Expose() userId: string = '';
  @Expose() username: string = '';
  @Expose() roles: string[] = [];
  @Expose() isSuperAdmin: boolean = false;
  @Expose() isAdmin: boolean = false;
  @Expose() isTestAdmin: boolean = false;
  @Expose() @Type(() => Date) timestampCreated?: Date | null = null;
  @Expose() @Type(() => Date) timestampLastLogin?: Date | null = null;

  @Expose() subIsLifetime: boolean = false;
  @Expose() subIsLifetimeEndDate?: Date | null = null;
  @Expose() @Type(() => Date) subSubscriptionEndDate?: Date | null = null;

  @Expose() stripeLiveCustomerId?: string | null = null;
  @Expose() stripeTestCustomerId?: string | null = null;
  @Expose() @Type(() => Date) subStripeEnd?: Date | null = null;
  @Expose() subStripeLivemode: boolean = false;
  @Expose() subStripePlan: string = '';
  @Expose() subStripePlanAmt: number = 0;
  @Expose() subStripePlanId: string = '';
  @Expose() @Type(() => Date) subStripeStart?: Date | null = null;
  @Expose() subStripeStatus: string = '';

  @Expose() subRevenueCatIsActive: boolean = false;
  @Expose() subRevenueCatWillRenew: boolean = false;
  @Expose() subRevenueCatPeriodType: string = '';
  @Expose() subRevenueCatProductIdentifier: string = '';
  @Expose() subRevenueCatIsSandbox: boolean = false;
  @Expose() @Type(() => Date) subRevenueCatOriginalPurchaseDate?: Date | null = null;
  @Expose() @Type(() => Date) subRevenueCatLatestPurchaseDate?: Date | null = null;
  @Expose() @Type(() => Date) subRevenueCatExpirationDate?: Date | null = null;
  @Expose() @Type(() => Date) subRevenueCatUnsubscribeDetectedAt?: Date | null = null;
  @Expose() @Type(() => Date) subRevenueCatBillingIssueDetectedAt?: Date | null = null;

  static fromJson(json: any): AuthUserModel {
    json = convertObjectDate(json);
    return plainToInstance(AuthUserModel, json, { exposeDefaultValues: true, excludeExtraneousValues: true });
  }

  static toJson(order: AuthUserModel): any {
    return instanceToPlain(order);
  }

  get hasAdminRole(): boolean {
    if (this.isSuperAdmin || this.isAdmin || this.isTestAdmin) return true;
    return false;
  }

  get getHasSubscription(): boolean {
    if (this.subIsLifetime) return true;
    if (this.subStripeEnd && this.subStripeEnd > new Date()) return true;
    if (this.subRevenueCatExpirationDate && this.subRevenueCatExpirationDate > new Date()) return true;
    return false;
  }
  get getHasSubscriptionString(): String {
    if (this.subIsLifetime) return 'Lifetime';
    if (this.subStripeEnd && this.subStripeEnd > new Date()) return 'Stripe';
    if (this.subRevenueCatExpirationDate && this.subRevenueCatExpirationDate > new Date()) return 'RevenueCat';
    return 'none';
  }

  get getSubscriptionEndDate(): Date | null | undefined {
    if (this.subIsLifetime) {
      if (this.subIsLifetimeEndDate) return this.subIsLifetimeEndDate;
      return new Date(2099, 11, 31);
    }
    if (this.subRevenueCatExpirationDate == null && this.subStripeEnd == null) return null;
    if (this.subRevenueCatExpirationDate != null) return this.subRevenueCatExpirationDate;
    return this.subStripeEnd;
  }
}

function convertObjectDate(json: any) {
  json.timestampCreated = convertToDate(json.timestampCreated);
  json.timestampUpdated = convertToDate(json.timestampUpdated);
  json.timestampLastLogin = convertToDate(json.timestampLastLogin);
  json.subIsLifetimeEndDate = convertToDate(json.subIsLifetimeEndDate);
  json.subSubscriptionEndDate = convertToDate(json.subSubscriptionEndDate);
  json.subStripeEnd = convertToDate(json.subStripeEnd);
  json.subStripeStart = convertToDate(json.subStripeStart);
  json.subRevenueCatOriginalPurchaseDate = convertToDate(json.subRevenueCatOriginalPurchaseDate);
  json.subRevenueCatLatestPurchaseDate = convertToDate(json.subRevenueCatLatestPurchaseDate);
  json.subRevenueCatExpirationDate = convertToDate(json.subRevenueCatExpirationDate);
  json.subRevenueCatUnsubscribeDetectedAt = convertToDate(json.subRevenueCatUnsubscribeDetectedAt);
  json.subRevenueCatBillingIssueDetectedAt = convertToDate(json.subRevenueCatBillingIssueDetectedAt);

  return json;
}
