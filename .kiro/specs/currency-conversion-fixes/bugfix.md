# Bugfix Requirements Document

## Introduction

The currency conversion feature in FinanceAI has two critical bugs that render it non-functional. First, the Frankfurter API service uses an incorrect domain (`frankfurter.dev`) that returns HTTP 404, causing the currency selector to only show USD. Second, the user registration form collects monthly income without associating a currency, so values entered in local currencies (e.g., CLP, ARS) are stored as if they were USD, leading to wildly incorrect financial data.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the application calls `https://frankfurter.dev/v1/latest?base=USD` to fetch exchange rates THEN the system receives an HTTP 404 Not Found response and `cargarTasas()` sets `tasas = {}`, leaving `monedasDisponibles` containing only `['USD']`

1.2 WHEN the currency selector renders with `tasas = {}` THEN the system only displays "USD" as the sole available currency, making currency conversion impossible

1.3 WHEN a user registers and enters their monthly income (e.g., 1,500,000 CLP) in step 2 of the registration form THEN the system stores the value without any currency metadata, treating it as USD regardless of the user's actual local currency

1.4 WHEN the stored income value (assumed USD) is later used for financial analysis THEN the system produces incorrect results because the raw numeric value from a non-USD currency is interpreted as dollars

### Expected Behavior (Correct)

2.1 WHEN the application fetches exchange rates THEN the system SHALL call the correct Frankfurter API endpoint (`https://api.frankfurter.app/latest?base=USD`) and receive a successful response with rate data

2.2 WHEN exchange rates are successfully loaded THEN the system SHALL populate `monedasDisponibles` with all available currencies from the API response, and the currency selector SHALL display all available options

2.3 WHEN a user registers and enters their monthly income in step 2 THEN the system SHALL require the user to also specify the currency of the income value (defaulting to USD)

2.4 WHEN the registration form submits income with a non-USD currency THEN the system SHALL convert the income value to USD using the current exchange rate before storing it, OR store both the value and its currency metadata

### Unchanged Behavior (Regression Prevention)

3.1 WHEN exchange rates are loaded successfully and a user selects a different currency THEN the system SHALL CONTINUE TO convert displayed monetary values using the selected exchange rate

3.2 WHEN a user enters their income in USD during registration THEN the system SHALL CONTINUE TO store the value directly without conversion (behaving as it does today for USD inputs)

3.3 WHEN the Frankfurter API is temporarily unreachable THEN the system SHALL CONTINUE TO gracefully fallback to USD-only mode with `tasas = {}` and `error = true`

3.4 WHEN a user logs in with existing credentials THEN the system SHALL CONTINUE TO authenticate normally without requiring income re-entry

3.5 WHEN the divisa store's `convertirDesdeUSD()` and `convertirAUSD()` functions are called with valid rates THEN the system SHALL CONTINUE TO perform arithmetic conversion correctly
