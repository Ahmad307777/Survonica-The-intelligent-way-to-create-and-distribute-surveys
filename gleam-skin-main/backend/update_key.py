
import os

key_variable = "HUGGINGFACE_API_KEY"
new_value = "YOUR_HUGGINGFACE_API_KEY_HERE"
# TARGET THE BACKEND DIRECTORY EXPLICITLY
env_path = os.path.join("backend", ".env")

# Fallback if running from INSIDE backend folder
if not os.path.exists('backend') and os.path.exists('.env'):
     env_path = ".env"

print(f"Targeting: {os.path.abspath(env_path)}")

try:
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.readlines()
            
        new_lines = []
        found = False
        for line in lines:
            if line.strip().startswith(f"{key_variable}="):
                new_lines.append(f"{key_variable}={new_value}\n")
                found = True
            else:
                new_lines.append(line)
        
        if not found:
            if new_lines and not new_lines[-1].endswith('\n'):
                 new_lines[-1] += '\n'
            new_lines.append(f"{key_variable}={new_value}\n")
            
        with open(env_path, "w") as f:
            f.writelines(new_lines)
        print(f"Successfully updated {key_variable} in {env_path}")
    else:
        print(f"File not found at {env_path}. Creating it...")
        with open(env_path, "w") as f:
            f.write(f"{key_variable}={new_value}\n")
        print(f"Created {env_path}")

except Exception as e:
    print(f"Error updating .env: {e}")
