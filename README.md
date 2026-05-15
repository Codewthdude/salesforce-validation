# Salesforce Validation Rule Manager

A React 18 + Vite application for connecting to a Salesforce Developer Org with OAuth 2.0, reading Account validation rules through the Tooling API, staging activation changes locally, and deploying those changes back to Salesforce.

## Screenshots

Add screenshots of the login screen, dashboard, rule cards, and deployment confirmation after connecting the app to your org.

## Prerequisites

- Node.js 18 or newer
- Salesforce Developer Org
- Salesforce Connected App with OAuth enabled
- Vercel account and CLI for production deployment

## Salesforce Connected App Setup

1. In Salesforce, go to Setup.
2. Open App Manager.
3. Select New Connected App.
4. Enter a connected app name, API name, and contact email.
5. Enable OAuth Settings.
6. Add callback URLs:
   - `http://localhost:5173/callback`
   - `https://your-vercel-app.vercel.app/callback`
7. Add OAuth scopes:
   - `api`
   - `refresh_token`
   - `offline_access`
8. Save the connected app.
9. Open Manage Consumer Details.
10. Copy the Consumer Key and Consumer Secret into `.env`.

Salesforce can take a few minutes to make a new connected app available for login.

## Local Setup

```bash
npm install
```

```bash
cp .env.example .env
```

Fill in `.env`:

```bash
VITE_SF_CLIENT_ID=your_connected_app_consumer_key
VITE_SF_CLIENT_SECRET=your_connected_app_consumer_secret
VITE_SF_REDIRECT_URI=http://localhost:5173/callback
VITE_SF_INSTANCE_URL=https://login.salesforce.com
```

Start the app:

```bash
npm run dev
```

Open `http://localhost:5173`.

## Vercel Deployment

Install and authenticate the Vercel CLI:

```bash
npm install -g vercel
vercel login
```

Deploy:

```bash
vercel deploy
```

Set the same environment variables in Vercel Project Settings. For production, set `VITE_SF_REDIRECT_URI` to your deployed callback URL, such as:

```bash
https://your-vercel-app.vercel.app/callback
```

The included `vercel.json` rewrites all routes to `index.html` so React Router can handle `/callback` and `/dashboard`.

## Validation Rules Setup Guide

Create a few Account validation rules to test the manager:

1. In Salesforce Setup, open Object Manager.
2. Select Account.
3. Open Validation Rules.
4. Select New.
5. Create rules like these:
   - `Require_Account_Number_For_Customer`: `AND(ISPICKVAL(Type, "Customer"), ISBLANK(AccountNumber))`
   - `Require_Phone_For_Prospect`: `AND(ISPICKVAL(Type, "Prospect"), ISBLANK(Phone))`
   - `No_Negative_Employees`: `NumberOfEmployees < 0`
   - `Require_Billing_Country`: `ISBLANK(BillingCountry)`
   - `Website_Must_Start_With_Https`: `AND(NOT(ISBLANK(Website)), NOT(BEGINS(Website, "https://")))`
6. Add clear error messages and save each rule.

Return to the app and select Fetch Rules.

## API Reference

The app uses the Salesforce OAuth 2.0 Web Server Flow:

- Authorization endpoint: `/services/oauth2/authorize`
- Token endpoint: `/services/oauth2/token`
- Scope: `api refresh_token`

After OAuth, the app stores the access token, instance URL, basic user info, and a client-side session expiry timestamp in `sessionStorage`.

The app fetches Account validation rules through the Tooling API:

```sql
SELECT Id, ValidationName, Active, Description, ErrorMessage, EntityDefinition.QualifiedApiName
FROM ValidationRule
WHERE EntityDefinition.QualifiedApiName = 'Account'
ORDER BY ValidationName ASC
```

Endpoint:

```text
GET /services/data/v59.0/tooling/query/?q=...
```

Validation rule activation changes are deployed with the Tooling API metadata envelope:

```json
{
  "Metadata": {
    "active": true
  }
}
```

Endpoint:

```text
PATCH /services/data/v59.0/tooling/sobjects/ValidationRule/{ruleId}
```

## Notes

- The app calls Salesforce directly from the browser with `Authorization: Bearer {token}`.
- The app stages toggle changes locally until Deploy Changes is selected.
- Toggling a rule back to its original state removes it from the pending change set.
- Session data is stored in `sessionStorage`, so closing the browser tab clears the session.
