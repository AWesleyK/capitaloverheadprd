import { GoogleReviewClient } from '@infinite-dev/google-review-api';

const GOOGLE_REVIEWS_URL = 'https://lfacsz2prflrkexacpdx5ijfua0ezkor.lambda-url.us-east-1.on.aws/';
const GOOGLE_REVIEWS_TOKEN = process.env.CLIENT_GBP_REVIEWS_TOKEN;

// Initialize the client once and export it
export const googleReviewClient = new GoogleReviewClient(
  GOOGLE_REVIEWS_URL,
  GOOGLE_REVIEWS_TOKEN
);
