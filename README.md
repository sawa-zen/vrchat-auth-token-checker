# vrchat-auth-token-checker

A CLI tool for easily obtaining VRChat API tokens. Since VRChat doesn't provide a direct way to issue API tokens, this tool helps you retrieve the token that is generated during login.

## Requirements

- Node.js >= 18.0.0

## Installation & Usage

You can use this tool without installation by running:

```bash
npx vrchat-auth-token-checker
```

## Features

- VRChat account login
- API token retrieval and display
- Two-factor authentication (2FA) support

## Example

```bash
$ npx vrchat-auth-token-checker

VRChat Username: your-username
Password: ********

# If 2FA is enabled
2FA Code: 123456

# Success output
Successfully logged in!
Your VRChat API Token: auth-token-xxxxx
```

The retrieved token can be used in headers when making requests to the VRChat API.

## Security

- Login credentials are used locally only and never sent to third parties
- Tokens are displayed only and not automatically saved
- All communication is done directly with the official VRChat API

## License

See [LICENSE](./LICENSE) file for details.
