import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      // @ts-expect-error Cognito config structure not recognized by types
      region: 'us-east-1',
      userPoolId: 'us-east-1_4rJjYWtYV', // your Cognito User Pool ID
      userPoolClientId: '6g4vno5ovl1jdtmffnbc3ccqra', // your Cognito App Client ID
    },
  },
});
