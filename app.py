import os
from flask import Flask, render_template, request, url_for, jsonify, send_file
from flask_cors import CORS
import openai
import ast
import subprocess
import re
import uuid
import shutil
import time
from werkzeug.utils import secure_filename
from slide_generator import make_animation_and_slide



# Load environment variables from a .env file
openai.api_key = "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" # Ensure your OpenAI API key is set

app = Flask(__name__)
cors = CORS(app,origins="*")

@app.route('/generate', methods=['GET','POST'])
def generate_video():
    data = request.json
    user_prompt = data['prompt']
    video_path = generate_and_render_video(user_prompt)
    if video_path:
        video_url = url_for('static', filename=os.path.basename(video_path), _external=True)
        return jsonify({'video': video_url})
    else:
        return jsonify({'error': 'Failed to generate video.'}), 400


UPLOAD_FOLDER = 'uploads'
STATIC_FOLDER = 'static'  # Folder for storing accessible files like pptx
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/generate-from-file', methods=['POST'])
def generate_from_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Save uploaded PDF file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(file_path)

        # Generate PPTX file
        pptx_path = make_animation_and_slide(file_path)

        if pptx_path.endswith('.pptx') and os.path.exists(pptx_path):
            # Move PPTX file to the static folder
            pptx_filename = os.path.basename(pptx_path)
            static_pptx_path = os.path.join(STATIC_FOLDER, pptx_filename)
            os.makedirs(STATIC_FOLDER, exist_ok=True)
            shutil.move(pptx_path, static_pptx_path)

            # Generate URL for the PPTX file
            pptx_url = url_for('static', filename=pptx_filename, _external=True)
            return jsonify({'pptx_url': pptx_url})
        else:
            return jsonify({'error': 'Failed to generate PPTX file.'}), 500
    else:
        return jsonify({'error': 'Invalid file type. Only PDF files are allowed.'}), 400

def generate_manim_code(prompt_text):
    # Craft the prompt for the AI
    openai_prompt = f"""
As a Manim expert in Community version 0.18.1, generate a Python script for the description below:

\"\"\"{prompt_text}\"\"\"

Requirements:
- Include necessary imports and define a 'GeneratedScene' subclass.
- Use compatible animation methods (Create, Transform, FadeIn, etc.).
- Ensure executable code without errors; use MathTex for math expressions if LaTeX issues arise.
- Text must be centered, within bounds, and appropriately sized to avoid overflow.
- In step-by-step explanations, each step should appear on a new page with its description at the top.
- Properly handle braces in LaTeX, avoiding unintended double braces.
- For graphing, use `axes.plot()`, e.g., `axes.plot(lambda x: np.sin(x), color=BLUE)`.

Provide only the code between triple backticks:

```python
# Your code here
"""

    try:
        response = openai.ChatCompletion.create(
            model='gpt-4o',  # Use 'gpt-4' if you have access
            messages=[{'role': 'user', 'content': openai_prompt}],
            temperature=0  # For deterministic output
        )
        # Extract the code from the response content
        content = response.choices[0].message['content']
        code = extract_code_from_response(content)
        return code
    except Exception as e:
        print(f"OpenAI API Error: {e}")
        return None

def extract_code_from_response(response_content):
    # Use regex to extract code between triple backticks
    code_blocks = re.findall(r"```python(.*?)```", response_content, re.DOTALL)
    if code_blocks:
        return code_blocks[0].strip()
    else:
        # If not found, try extracting any code block
        code_blocks = re.findall(r"```(.*?)```", response_content, re.DOTALL)
        if code_blocks:
            return code_blocks[0].strip()
        else:
            # Return the entire content if no code blocks are found
            return response_content.strip()

def is_valid_python_code(code):
    try:
        ast.parse(code)
        return True
    except SyntaxError as e:
        print(f"Syntax Error in Generated Code: {e}")
        return False

def save_code(code, filename='generated_scene.py'):
    import os
    # Ensure the 'codes' directory exists
    os.makedirs('codes', exist_ok=True)
    # Save the file in the 'codes' directory
    filepath = os.path.join('codes', filename)
    with open(filepath, 'w') as file:
        file.write(code)

def render_video(scene_file='generated_scene.py', scene_name='GeneratedScene', output_filename='output_video.mp4'):
    command = [
        'manim', f'codes/{scene_file}', '-qm'  # Medium quality
    ]
    try:
        subprocess.run(command, check=True)
        # Locate the output video in Manim's default output directory
        video_dir = os.path.join(
            'media',
            'videos',
            scene_file.replace('/codes','').replace('.py', ''),
            '720p30'  # Adjust based on quality settings
        )
        for file in os.listdir(video_dir):
            if file.endswith('.mp4'):
                source_video_path = os.path.join(video_dir, file)
                output_dir = 'static'
                if not os.path.exists(output_dir):
                    os.makedirs(output_dir)
                output_path = os.path.join(output_dir, output_filename)
                shutil.copyfile(source_video_path, output_path)
                return output_path
        print("Video file not found.")
        return None
    except Exception as e:
        print(f"Rendering failed: {e}")
        return None


def generate_and_render_video(user_prompt, max_attempts=3):
    unique_id = str(uuid.uuid4())
    scene_filename = f'generated_scene_{unique_id}.py'
    video_filename = f'output_video_{unique_id}.mp4'

    for attempt in range(max_attempts):
        try:
            code = generate_manim_code(user_prompt)
            if code and is_valid_python_code(code):
                save_code(code, filename=scene_filename)
                video_file = render_video(scene_file=scene_filename, output_filename=video_filename)
                if video_file and os.path.exists(video_file):
                    return video_file
                else:
                    raise Exception("Video rendering failed.")
            else:
                raise Exception("Invalid code generated.")
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_attempts - 1:
                # Prepare a new prompt with the error information
                new_prompt = f"""
                Previous attempt failed with the following error: {str(e)}
                Here's the code that caused the error:

                {code}
                
                
                - In cases where LaTeX compatibility remains an issue, you might try using MathTex (specifically for math expressions) in place of regular Tex,
                - “Generate LaTeX code for Manim with proper brace handling, avoiding unintended double braces and ensuring all expressions are fully enclosed.”
                Please generate a new Manim script that addresses this error and fulfills the original request:
                {user_prompt}
                """
                user_prompt = new_prompt
            else:
                print("All attempts failed. Proceeding with usual rendering failed error procedure.")
                return None

    return None

if __name__ == '__main__':
    app.run(debug=True, port = 8000, use_reloader=False)