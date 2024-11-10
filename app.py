import os
from flask import Flask, render_template, request, url_for, jsonify
from flask_cors import CORS
import openai
import ast
import subprocess
import re
import uuid
import shutil



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

def generate_manim_code(prompt_text):
    # Craft the prompt for the AI
    openai_prompt = f"""
As a Manim expert using Manim Community version 0.18.1, generate a Manim Python script that visualizes the following description:

\"\"\"{prompt_text}\"\"\"

Requirements:
- The script should include all necessary imports.
- Define a Scene subclass called 'GeneratedScene'.
- Use methods and classes compatible with Manim Community v0.18.1.
- Include animations using 'self.play()' with appropriate animation functions (e.g., 'Create', 'Transform', 'FadeIn', 'FadeOut', 'MoveTo', etc.).
- The code should be executable without errors.
- Do not include any explanations or text other than the code.
- Use axes.plot(): In Manim v0.18.1, the get_graph() method has been replaced by axes.plot(). This is the new way to create a graph from a function. The method signature for axes.plot() does accept a function (like lambda x: np.sin(x)), and you can pass additional arguments like color directly in the method.
  axes.plot(lambda x: np.sin(x), color=BLUE) creates the sine wave with the desired color.

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
    with open(filename, 'w') as file:
        file.write(code)

def render_video(scene_file='generated_scene.py', scene_name='GeneratedScene', output_filename='output_video.mp4'):
    command = [
        'manim', scene_file, scene_name, '-qm'  # Medium quality
    ]
    try:
        subprocess.run(command, check=True)
        # Locate the output video in Manim's default output directory
        video_dir = os.path.join(
            'media',
            'videos',
            scene_file.replace('.py', ''),
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

def generate_and_render_video(user_prompt):
    unique_id = str(uuid.uuid4())
    scene_filename = f'generated_scene_{unique_id}.py'
    video_filename = f'output_video_{unique_id}.mp4'
    code = generate_manim_code(user_prompt)
    if code and is_valid_python_code(code):
        # Save the generated code to a unique file
        save_code(code, filename=scene_filename)
        # Render the video using the unique scene file and output filename
        video_file = render_video(scene_file=scene_filename, output_filename=video_filename)
        if video_file and os.path.exists(video_file):
            return video_file
        else:
            print("Video rendering failed.")
            return None
    else:
        print("Invalid code generated.")
        return None

if __name__ == '__main__':
    app.run(debug=True, port = 8080, use_reloader=False)