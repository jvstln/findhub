# Encryption Service

The encryption service provides secure AES-256-GCM encryption and decryption for sensitive data such as security question answers.

## Setup

### 1. Generate Encryption Key

Before using the encryption service, you must generate a secure encryption key:

```bash
bun run generate:encryption-key
```

This will output a 64-character hexadecimal string (32 bytes).

### 2. Configure Environment Variable

Add the generated key to your `.env` file:

```bash
ENCRYPTION_KEY=your_64_character_hex_string_here
```

**Important Security Notes:**
- Never commit the encryption key to version control
- Use different keys for development, staging, and production
- Store production keys in a secure secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault)
- Rotate keys periodically following your security policy

## Usage

### Encrypting Data

```typescript
import { encrypt } from "./services/encryption.service";

const plainText = "Sensitive answer";
const { encryptedText, iv, authTag } = encrypt(plainText);

// Store all three values in the database
// - encryptedText: The encrypted data
// - iv: Initialization vector (unique per encryption)
// - authTag: Authentication tag for integrity verification
```

### Decrypting Data

```typescript
import { decrypt } from "./services/encryption.service";

// Retrieve from database
const encryptedText = "...";
const iv = "...";
const authTag = "...";

try {
	const plainText = decrypt(encryptedText, iv, authTag);
	console.log(plainText); // "Sensitive answer"
} catch (error) {
	// Handle decryption errors
	// - Wrong key
	// - Tampered data
	// - Corrupted data
}
```

## Security Features

### AES-256-GCM

The service uses AES-256-GCM (Galois/Counter Mode) which provides:

- **Confidentiality**: Data is encrypted and unreadable without the key
- **Authenticity**: Authentication tag ensures data hasn't been tampered with
- **Integrity**: Any modification to encrypted data will be detected during decryption

### Unique Initialization Vectors

Each encryption operation generates a unique random IV, ensuring:

- Same plaintext produces different ciphertext each time
- Protection against pattern analysis attacks
- Enhanced security even if the same data is encrypted multiple times

### Key Validation

The service validates the encryption key on every operation:

- Must be exactly 64 hexadecimal characters (32 bytes)
- Must be a valid hex string (0-9, a-f, A-F)
- Clear error messages if key is missing or invalid

## Error Handling

### Encryption Errors

```typescript
try {
	const result = encrypt(plainText);
} catch (error) {
	// Possible errors:
	// - ENCRYPTION_KEY not set
	// - Invalid key format
	// - Encryption operation failed
}
```

### Decryption Errors

```typescript
try {
	const plainText = decrypt(encryptedText, iv, authTag);
} catch (error) {
	// Possible errors:
	// - ENCRYPTION_KEY not set
	// - Invalid key format
	// - Authentication tag verification failed (tampered data)
	// - Invalid IV or encrypted text format
	// - Decryption operation failed
}
```

## Testing

Run the encryption service tests:

```bash
bun test apps/server/src/services/encryption.service.test.ts
```

The test suite covers:
- Basic encryption/decryption
- Unique IV generation
- Authentication tag verification
- Error handling
- Edge cases (empty strings, long text, unicode)
- Key validation

## Production Considerations

### Key Management

1. **Generation**: Use the provided script or a cryptographically secure random generator
2. **Storage**: Store in a secure secrets manager, not in code or config files
3. **Access**: Limit access to the key to only necessary services and personnel
4. **Rotation**: Implement a key rotation strategy (requires re-encrypting existing data)
5. **Backup**: Securely backup keys to prevent data loss

### Performance

- Encryption/decryption operations are fast (< 1ms for typical data)
- No significant performance impact for normal usage
- Consider caching decrypted data in memory if accessed frequently (with appropriate security measures)

### Monitoring

Monitor for:
- Decryption failures (may indicate key issues or attacks)
- Encryption operation latency
- Key access patterns

## Example: Security Questions

```typescript
import { encrypt, decrypt } from "./services/encryption.service";

// When creating a security question
const answer = "Dell Laptop";
const { encryptedText, iv, authTag } = encrypt(answer);

await db.insert(securityQuestions).values({
	questionText: "What brand is the laptop?",
	encryptedAnswer: encryptedText,
	iv: iv,
	authTag: authTag,
	// ... other fields
});

// When retrieving for admin view
const question = await db
	.select()
	.from(securityQuestions)
	.where(eq(securityQuestions.id, questionId))
	.limit(1);

const decryptedAnswer = decrypt(
	question.encryptedAnswer,
	question.iv,
	question.authTag,
);

console.log(decryptedAnswer); // "Dell Laptop"
```

## Troubleshooting

### "ENCRYPTION_KEY environment variable is not set"

**Solution**: Generate and set the encryption key in your `.env` file:

```bash
bun run generate:encryption-key
# Copy the output to .env
```

### "ENCRYPTION_KEY must be a 64-character hex string"

**Solution**: Ensure your key is exactly 64 characters and contains only hex digits (0-9, a-f, A-F).

### "Authentication tag verification failed"

**Possible causes**:
- Data has been tampered with
- Wrong encryption key is being used
- Corrupted data in database
- IV or auth tag doesn't match the encrypted text

**Solution**: Verify the encryption key is correct and data hasn't been modified.
