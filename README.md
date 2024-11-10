# Manimator

## Overview
Manimator is a project designed for creating animations programmatically using Manim and supporting user interaction through a web interface built with Flask and other supporting technologies.

## Prerequisites
- Python (version 3.x)
- Node.js and npm (Ensure Node.js is installed before running npm commands. [Download Node.js](https://nodejs.org/))
- Manim (for generating animations)

## Installation Steps

### Step 1: Clone the Repository
Clone the GitHub repository to your local machine:
```bash
git clone https://github.com/Kandel-Bibas/Manimator.git
cd Manimator
```

### Step 2: Install Python Dependencies
Ensure `pip` is installed and use it to install all Python packages listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```

### Step 3: Install npm Packages
Ensure Node.js is installed, then use `npm ci` to install all dependencies exactly as specified in `package-lock.json`:
```bash
npm ci
```

## Setting Up OpenAI Key
To use OpenAI's services, you need to have your own API key. Add your OpenAI key to `app.py` by setting it as an environment variable or directly in the code (not recommended for production).

1. **Option 1: Set as Environment Variable**
   ```bash
   export OPENAI_API_KEY='your-openai-api-key'
   ```

2. **Option 2: Add Directly in `app.py`**
   ```python
   import openai
   openai.api_key = 'your-openai-api-key'
   ```

## Running the Project
Once all dependencies are installed, you can run the Flask app and use Manim to create animations.

### Run Flask App
```bash
python app.py
```

### Start Frontend
Navigate to the frontend directory:
```bash
cd manim-video-generator
```
Then start the frontend with:
```bash
npm start
```


## Additional Notes
- Ensure `node_modules` and `venv` (or equivalent Python virtual environment) are properly set up for a smooth project execution.
- Refer to Manim's [documentation](https://docs.manim.community/en/stable/) for additional configuration and usage guidance.

## Troubleshooting
- If you encounter any issues with `npm ci`, ensure that your Node.js and npm versions are up-to-date.
- For Python-related issues, confirm your Python environment is correctly set up and packages are installed in the appropriate environment.
