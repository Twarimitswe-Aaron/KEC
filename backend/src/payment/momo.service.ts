import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MomoService {
  private BASE_URL = process.env.MOMO_BASE_URL;
  private SUB_KEY = process.env.MOMO_SUB_KEY;
  private API_USER = process.env.MOMO_API_USER;
  private API_KEY = process.env.MOMO_API_KEY;
  private ENV = process.env.MOMO_ENVIRONMENT;
  private CALLBACK = process.env.MOMO_CALLBACK_URL;

  private tokenCache = {
    token: null as string | null,
    expires: null as Date | null,
  };

  async getToken(): Promise<string> {
    if (
      this.tokenCache.token &&
      this.tokenCache.expires &&
      this.tokenCache.expires > new Date()
    ) {
      console.log('🔑 [MoMo] Using cached token');
      return this.tokenCache.token;
    }

    console.log('🔑 [MoMo] Fetching new token...');

    if (!this.API_USER || !this.API_KEY || !this.SUB_KEY) {
      throw new Error(
        'MTN MoMo API credentials not configured. Check environment variables.',
      );
    }

    const url = `${this.BASE_URL}/collection/token/`;

    const resp = await axios.post(
      url,
      {},
      {
        auth: {
          username: this.API_USER,
          password: this.API_KEY,
        },
        headers: {
          'Ocp-Apim-Subscription-Key': this.SUB_KEY,
        },
      },
    );

    const data = resp.data;

    this.tokenCache.token = data.access_token;
    this.tokenCache.expires = new Date(Date.now() + data.expires_in * 1000);

    console.log('✅ [MoMo] Token fetched successfully');
    return data.access_token;
  }

  async requestToPay(
    msisdn: string,
    amount: string,
    externalId?: string,
  ): Promise<{ referenceId: string; status: number }> {
    const token = await this.getToken();
    const referenceId = uuidv4();

    // ✅ FIX (A): Normalize MSISDN format - remove '+' and ensure proper format
    // MTN Rwanda expects format: 250780000001 (NO plus sign, NO double country code)
    let normalizedMsisdn = msisdn.trim().replace(/\s/g, ''); // Remove spaces
    normalizedMsisdn = normalizedMsisdn.replace(/^\+/, ''); // Remove leading '+'

    // If it starts with duplicate country code like '250250', fix it
    if (normalizedMsisdn.startsWith('250250')) {
      normalizedMsisdn = normalizedMsisdn.substring(3); // Remove first '250'
    }

    // Ensure it starts with country code
    if (!normalizedMsisdn.startsWith('250')) {
      normalizedMsisdn = '250' + normalizedMsisdn;
    }

    const url = `${this.BASE_URL}/collection/v1_0/requesttopay`;

    const headers: any = {
      'X-Reference-Id': referenceId,
      'X-Target-Environment': this.ENV,
      'Ocp-Apim-Subscription-Key': this.SUB_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // Only add callback URL if explicitly configured
    // Otherwise, MTN MoMo will use the callback URL set during API user creation
    if (this.CALLBACK) {
      headers['X-Callback-Url'] = this.CALLBACK;
    }

    // ✅ FIX (C): Validate externalId to ensure it doesn't contain 'undefined'
    const validExternalId = externalId || uuidv4();
    if (validExternalId.includes('undefined')) {
      console.error(
        '❌ [MoMo] Invalid externalId contains undefined:',
        validExternalId,
      );
      throw new Error('Invalid externalId: userId is undefined');
    }

    const body = {
      amount: amount,
      // ✅ FIX (B): MTN Rwanda Collection API expects RWF, not EUR
      currency: process.env.MOMO_CURRENCY || 'RWF',
      externalId: validExternalId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: normalizedMsisdn,
      },
      payerMessage: 'Course Enrollment Payment',
      payeeNote: 'Payment for course enrollment',
    };

    console.log('💳 [MoMo] Initiating payment request:', {
      referenceId,
      amount,
      originalMsisdn: msisdn,
      normalizedMsisdn,
      externalId: validExternalId,
      currency: body.currency,
    });

    const resp = await axios.post(url, body, { headers });

    console.log('✅ [MoMo] Payment request sent:', resp.status);
    return { referenceId, status: resp.status };
  }

  async checkPayment(referenceId: string): Promise<any> {
    const token = await this.getToken();

    const url = `${this.BASE_URL}/collection/v1_0/requesttopay/${referenceId}`;

    const headers = {
      'X-Target-Environment': this.ENV,
      'Ocp-Apim-Subscription-Key': this.SUB_KEY,
      Authorization: `Bearer ${token}`,
    };

    console.log('🔍 [MoMo] Checking payment status:', referenceId);
    const resp = await axios.get(url, { headers });

    console.log('📊 [MoMo] Payment status:', resp.data.status);
    return resp.data;
  }
}
