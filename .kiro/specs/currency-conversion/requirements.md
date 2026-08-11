# Requirements Document

## Introduction

This feature adds multi-currency support to the FinanceAI frontend. The backend stores all monetary amounts in USD. The frontend will allow users to select a preferred display currency from those supported by the Frankfurter API (ECB rates). Amounts displayed throughout the application are converted from USD to the chosen currency. When creating or editing transactions, amounts entered in the local currency are converted back to USD before sending to the backend. The user's currency preference persists across sessions via localStorage, and exchange rates are fetched once per session at application startup.

## Glossary

- **CurrencyService**: Frontend service module responsible for communicating with the Frankfurter API to obtain exchange rates.
- **CurrencyStore**: Pinia store that holds the selected currency code, the exchange rates map, and provides conversion utilities.
- **CurrencySelector**: UI component rendered in AppNav that allows the user to pick a display currency.
- **Frankfurter_API**: External REST API at frankfurter.dev providing ECB exchange rates with USD as base currency.
- **LocalStorage**: Browser Web Storage API used to persist the user's currency preference between sessions.
- **AppNav**: The application's top navigation bar component.
- **FormatoMoneda**: Utility function that formats monetary values for display, applying the active currency symbol and locale formatting.
- **TransactionForm**: The FormularioTransaccion component where users enter transaction amounts.

## Requirements

### Requirement 1: Exchange Rate Retrieval

**User Story:** As a user, I want the application to fetch current exchange rates when it loads, so that all amounts are displayed in my chosen currency with up-to-date conversion rates.

#### Acceptance Criteria

1. WHEN the application initializes, THE CurrencyService SHALL request exchange rates from the Frankfurter_API using USD as the base currency.
2. WHEN the Frankfurter_API returns a successful response, THE CurrencyStore SHALL store the rates map containing currency codes and their conversion factors relative to USD.
3. IF the Frankfurter_API request fails, THEN THE CurrencyStore SHALL retain a fallback rate of 1.0 for USD and display amounts in USD without conversion.
4. THE CurrencyService SHALL make exactly one request to the Frankfurter_API per application session (page load).
5. WHILE the exchange rate request is in progress, THE CurrencyStore SHALL expose a loading state that consuming components can use to show feedback.

### Requirement 2: Currency Preference Persistence

**User Story:** As a user, I want my currency selection to be remembered between sessions, so that I do not have to choose my preferred currency every time I open the application.

#### Acceptance Criteria

1. WHEN the user selects a currency from the CurrencySelector, THE CurrencyStore SHALL save the selected currency code to LocalStorage.
2. WHEN the application initializes, THE CurrencyStore SHALL read the previously saved currency code from LocalStorage and set it as the active currency.
3. IF no currency preference exists in LocalStorage, THEN THE CurrencyStore SHALL default to USD as the active currency.
4. WHEN the user changes the active currency, THE CurrencyStore SHALL update the stored preference in LocalStorage immediately.

### Requirement 3: Currency Selector UI

**User Story:** As a user, I want a currency selector always visible in the navigation bar, so that I can switch my display currency at any time without navigating away from the current page.

#### Acceptance Criteria

1. THE CurrencySelector SHALL render inside AppNav and remain visible on all authenticated pages.
2. THE CurrencySelector SHALL display the list of currencies available from the Frankfurter_API rates response.
3. THE CurrencySelector SHALL visually indicate the currently active currency.
4. WHEN the user selects a different currency, THE CurrencySelector SHALL update the CurrencyStore active currency immediately.
5. WHILE exchange rates have not yet loaded, THE CurrencySelector SHALL be disabled and display only USD.

### Requirement 4: Display Amount Conversion (USD to Local Currency)

**User Story:** As a user, I want all monetary amounts in the interface shown in my chosen currency, so that I can understand my finances in familiar monetary units.

#### Acceptance Criteria

1. WHEN the CurrencyStore has a valid exchange rate for the active currency, THE FormatoMoneda function SHALL convert amounts from USD to the active currency by multiplying by the exchange rate.
2. THE FormatoMoneda function SHALL display the appropriate currency symbol or ISO code for the active currency.
3. WHEN the active currency is USD, THE FormatoMoneda function SHALL display amounts without applying any conversion factor.
4. WHEN the active currency changes, THE application SHALL re-render all displayed monetary values using the new currency conversion.

### Requirement 5: Input Amount Conversion (Local Currency to USD)

**User Story:** As a user, I want to enter transaction amounts in my local currency, so that I can record expenses in the currency I actually spend without manual conversion.

#### Acceptance Criteria

1. WHEN a user submits a transaction, THE TransactionForm SHALL convert the entered amount from the active currency to USD by dividing by the active exchange rate before sending the data to the backend.
2. WHEN the active currency is USD, THE TransactionForm SHALL send the entered amount to the backend without applying any conversion.
3. THE TransactionForm SHALL display a label or indicator showing in which currency the user is entering the amount.
4. IF the exchange rate for the active currency is unavailable, THEN THE TransactionForm SHALL treat the amount as USD and inform the user that conversion is unavailable.

### Requirement 6: Supported Currencies

**User Story:** As a user, I want to choose from the major currencies provided by the ECB, so that I have a relevant set of international currencies available.

#### Acceptance Criteria

1. THE CurrencyStore SHALL populate the available currencies list exclusively from the currencies returned by the Frankfurter_API response.
2. THE CurrencyStore SHALL always include USD in the available currencies list regardless of the API response content.
3. THE CurrencySelector SHALL present currencies using their three-letter ISO 4217 code.
