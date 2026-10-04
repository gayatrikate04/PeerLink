import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import LabelEncoder
import numpy as np
import joblib

# Load data
df = pd.read_csv('profiles.csv')

# Example target: Recommend occupation (can be changed)
target_col = 'Occupation'

# Drop rows where target is missing
df = df.dropna(subset=[target_col])

# Select features (excluding target and highly unique columns)
features = ['City', 'State', 'Country', 'Industry', 'Connections', 'Skills', 'Latest Company', 'Education Degree']
X = df[features]
y = df[target_col]

# Encode categorical features
encoder = {}
for col in X.columns:
    if X[col].dtype == 'object':
        le = LabelEncoder()
        X[col] = X[col].astype(str)
        X[col] = le.fit_transform(X[col])
        encoder[col] = le

# Handle missing values
imputer = SimpleImputer(strategy='most_frequent')
X_imputed = imputer.fit_transform(X)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X_imputed, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Save model and preprocessors
joblib.dump(model, 'recommendation_model.joblib')
joblib.dump(imputer, 'imputer.joblib')
joblib.dump(encoder, 'encoder.joblib')

print('Model trained and saved.')

# Prediction function with missing data handling
def recommend(input_dict):
    # Load model and preprocessors
    model = joblib.load('recommendation_model.joblib')
    imputer = joblib.load('imputer.joblib')
    encoder = joblib.load('encoder.joblib')
    
    # Prepare input
    input_data = []
    for col in features:
        val = input_dict.get(col, np.nan)
        if col in encoder:
            le = encoder[col]
            if pd.isna(val):
                input_data.append(np.nan)
            else:
                try:
                    input_data.append(le.transform([str(val)])[0])
                except:
                    input_data.append(np.nan)
        else:
            input_data.append(val)
    # Impute missing values
    input_data = np.array(input_data).reshape(1, -1)
    input_data = imputer.transform(input_data)
    # Predict
    pred = model.predict(input_data)
    return pred[0]

# Example usage
example_input = {
    'City': 'Bengaluru',
    'State': 'Karnataka',
    'Country': 'India',
    'Industry': 'information technology and services',
    'Connections': 500,
    'Skills': 'python, machine learning',
    'Latest Company': 'Cognizant',
    'Education Degree': 'Bachelor of Technology - BTech'
}
print('Recommended occupation:', recommend(example_input))

# Example with missing parameters
example_input_missing = {
    'City': 'Bengaluru',
    'State': 'Karnataka',
    'Country': 'India',
    # 'Industry' missing
    'Connections': 500,
    # 'Skills' missing
    'Latest Company': 'Cognizant',
    'Education Degree': 'Bachelor of Technology - BTech'
}
print('Recommended occupation (with missing):', recommend(example_input_missing))
