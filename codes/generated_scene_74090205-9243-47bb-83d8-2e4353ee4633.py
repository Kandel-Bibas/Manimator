from manim import *

class GeneratedScene(Scene):
    def construct(self):
        # Title
        title = Text("Fourier Series", font_size=48)
        self.play(Write(title))
        self.wait(2)
        self.play(FadeOut(title))

        # Step 1: Introduction to Fourier Series
        step1_title = Text("Step 1: Introduction", font_size=36).to_edge(UP)
        step1_text = Text(
            "A Fourier series is a way to represent a function as the sum of simple sine waves.",
            font_size=24
        ).next_to(step1_title, DOWN)
        self.play(FadeIn(step1_title), FadeIn(step1_text))
        self.wait(3)
        self.play(FadeOut(step1_title), FadeOut(step1_text))

        # Step 2: Mathematical Expression
        step2_title = Text("Step 2: Mathematical Expression", font_size=36).to_edge(UP)
        step2_text = MathTex(
            "f(x) = a_0 + \\sum_{n=1}^{\\infty} \\left( a_n \\cos(nx) + b_n \\sin(nx) \\right)",
            font_size=36
        ).next_to(step2_title, DOWN)
        self.play(FadeIn(step2_title), Write(step2_text))
        self.wait(3)
        self.play(FadeOut(step2_title), FadeOut(step2_text))

        # Step 3: Example Graph
        step3_title = Text("Step 3: Example Graph", font_size=36).to_edge(UP)
        self.play(FadeIn(step3_title))

        # Create axes
        axes = Axes(
            x_range=[0, 2 * PI, PI / 4],
            y_range=[-2, 2, 1],
            axis_config={"color": BLUE}
        ).add_coordinates()

        # Plot a simple Fourier series approximation
        fourier_series = axes.plot(
            lambda x: 0.5 + np.cos(x) - 0.5 * np.cos(2 * x),
            color=RED
        )

        # Labels
        x_label = axes.get_x_axis_label("x")
        y_label = axes.get_y_axis_label("f(x)")

        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(fourier_series))
        self.wait(3)

        # Fade out all
        self.play(FadeOut(step3_title), FadeOut(axes), FadeOut(fourier_series), FadeOut(x_label), FadeOut(y_label))