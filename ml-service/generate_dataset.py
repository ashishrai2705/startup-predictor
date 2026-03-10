import numpy as np
import pandas as pd

# Set random seed for reproducibility
np.random.seed(42)

# Generate 5000 startup records
n_samples = 5000

# Generate features with specified ranges
funding = np.random.uniform(100_000, 20_000_000, n_samples)  # 100k to 20M
team_size = np.random.randint(1, 51, n_samples)  # 1 to 50
market_size = np.random.uniform(1_000_000, 1_000_000_000, n_samples)  # 1M to 1B
founder_experience = np.random.uniform(0, 20, n_samples)  # 0 to 20 years

# Calculate success probability based on features
# Normalize each feature to 0-1 scale for probability calculation
funding_norm = np.minimum(funding / 5_000_000, 1.0)
market_norm = np.minimum(market_size / 500_000_000, 1.0)
experience_norm = np.minimum(founder_experience / 10, 1.0)

# Team size performs best at ~10, penalty for too small or too large
team_norm = 1.0 - (np.abs(team_size - 10) / 40) ** 0.8
team_norm = np.maximum(team_norm, 0.1)  # Ensure minimum score

# Calculate success probability (0 to 1)
success_probability = (
    funding_norm * 0.40 +
    team_norm * 0.20 +
    market_norm * 0.25 +
    experience_norm * 0.15
)

# Add some randomness
success_probability += np.random.normal(0, 0.05, n_samples)
success_probability = np.clip(success_probability, 0, 1)

# Generate success labels (1 if probability > 0.5, else 0)
success = (success_probability > 0.5).astype(int)

# Create DataFrame
df = pd.DataFrame({
    'funding': funding,
    'teamSize': team_size,
    'marketSize': market_size,
    'founderExperience': founder_experience,
    'success': success
})

# Save to CSV
df.to_csv('startup_dataset.csv', index=False)

print(f"Dataset generated successfully!")
print(f"Total samples: {len(df)}")
print(f"\nDataset statistics:")
print(df.describe())
print(f"\nSuccess distribution:")
print(df['success'].value_counts())
print(f"Success rate: {df['success'].mean():.2%}")
