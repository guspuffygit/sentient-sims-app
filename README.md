# Sentient Sims App

The Sentient Sims app is an app that runs while you play the Sentient Sims mod.

The application is needed to be able to talk to the Open AI API securely. The Sims 4 developers
did not include the necessary code to be able to securely send requests, which is needed to
talk to the internet. If you dont have this, the communication is sent in plain text and anyone
can intercept your data and read it.

The app also handles state and saves for the mod.

[Checkout the wiki for more details.](https://github.com/guspuffygit/sentient-sims-app/wiki)

# Contributing

Contributions are welcome, the app is open source.

Questions? [Join the Discord!](https://discord.com/invite/JTjbydmUAp)

## Prerequisites
- Node.js (v18)
- npm

## Setup

To get this project up and running locally, follow these steps:

1. **Clone the repository:**
```bash
git clone https://github.com/guspuffygit/sentient-sims-app.git
```
1. **Navigate to the project directory:**
```bash
cd sentient-sims-app
```

1. **Install dependencies:**
```bash
npm ci
```

## Running the Project

To run the project locally:

```bash
npm run start
```

With the app running in development mode, you can play the mod at this point while making changes to the app.

## Linting

To verify changes are linted correctly, run:
```bash
npm run lint
```

## Compiling Typescript

To verify changes are compiled correctly with typescript, run:
```bash
npm run compile
```

## Testing

There are integration and unit tests that can be ran locally to verify changes.

Integration tests require an OpenAI API Key to be present in the environment variables for part of the test.

OPENAI_KEY=sk-***

### Run Unit Tests

```bash
npm run test:unit
```

### Run All Tests (Integration, Unit)
```bash
npm run test
```

## Making a Change

1. Fork the repository
1. Make changes as necessary
1. Run the tests and verify linting is successful locally
1. Open a PR
