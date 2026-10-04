import json
import pandas as pd

def convert_text_to_csv(input_file, output_file):
    raw_data = []
    
    # 1. Read the text file line by line
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                if line:  # Skip any empty lines
                    try:
                        # Parse the JSON string into a Python dictionary
                        profile = json.loads(line)
                        raw_data.append(profile)
                    except json.JSONDecodeError:
                        print("Skipped a line: Not a valid JSON format.")
    except FileNotFoundError:
        print(f"Error: Could not find the file '{input_file}'.")
        return

    # 2. Extract the specific fields we want
    flattened_data = []
    for profile in raw_data:
        data = {
            "Full Name": profile.get("full_name"),
            "Occupation": profile.get("occupation"),
            "City": profile.get("city"),
            "State": profile.get("state"),
            "Country": profile.get("country_full_name"),
            "Industry": profile.get("industry"),
            "Connections": profile.get("connections"),
            "Skills": ", ".join(profile.get("skills", [])),
        }
        
        # Extract the most recent Experience
        experiences = profile.get("experiences", [])
        if experiences:
            latest = experiences[0]
            data["Latest Company"] = latest.get("company")
            data["Latest Title"] = latest.get("title")
        else:
            data["Latest Company"] = None
            data["Latest Title"] = None

        # Extract the highest Education
        education = profile.get("education", [])
        if education:
            latest_edu = education[0]
            data["Education School"] = latest_edu.get("school")
            data["Education Degree"] = latest_edu.get("degree_name")
        else:
            data["Education School"] = None
            data["Education Degree"] = None

        flattened_data.append(data)
    
    # 3. Convert to a DataFrame and save to CSV
    if flattened_data:
        df = pd.DataFrame(flattened_data)
        df.to_csv(output_file, index=False, encoding='utf-8')
        print(f"Success! Converted {len(flattened_data)} profiles and saved to '{output_file}'.")
    else:
        print("No valid data was found to convert.")

# --- Run the Script ---
# Make sure your text file is in the same folder as this Python script
input_filename = 'dataset.txt'   # Change this to the name of your text file
output_filename = 'profiles.csv' 

convert_text_to_csv(input_filename, output_filename)