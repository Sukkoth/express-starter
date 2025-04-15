export type MessageServiceType = 'A2P' | 'OTP';
export enum SmsType {
  GSM = 'GSM',
  Unicode = 'Unicode',
}

export interface QueueJob {
  /**Message Id */
  id: string;
  /**To whom you are sending the message */
  to: string;
  /** Message content being sent */
  text: string;
  /**Which encoding the message is using { @see SmsType}*/
  smsType: SmsType;
  /**Which service is being used to send the message { @see MessageServiceType} */
  serviceType: MessageServiceType;
  /**Callback url for the message when it's delivered*/
  callbackUrl?: string;
  /**SMSC related config */
  config: SmscConfig;
  /**The actual date when the message was received via api call */
  createdAt: Date;
  /**Any additional data you want to pass to the job
   * Could be useful when you want to add data related to tracking time, like sentry baggage
   */
  meta?: unknown;
}

export interface SmscConfig {
  /**SMSC id for the sender id */
  smscId: string;
  /**From which sender id you are sending the message */
  from: string;
  /**password for the smsc id */
  password: string;
  /**username for the smsc id */
  username: string;
  /**Team id of the sender id */
  teamId: string;
  /**Company id of the sender id */
  companyId: string;
}
