from manim import *

class PowerRule(Scene):
    def construct(self):
        # Title
        title = Text("Power Rule").scale(0.8)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Function
        func = MathTex("f(x) = x^n").scale(0.8)
        self.play(Write(func))
        self.wait(1)

        # Derivative
        deriv = MathTex("f'(x) = nx^{n-1}").scale(0.8)
        self.play(TransformMatchingShapes(func, deriv))  # Smooth transition
        self.wait(2)
        self.play(FadeOut(deriv))


        # Example title
        example_title = Text("Example").scale(0.8)
        self.play(Write(example_title))
        self.wait(1)
        self.play(FadeOut(example_title))

        # Example function
        example_func = MathTex("f(x) = x^3").scale(0.8)
        self.play(Write(example_func))
        self.wait(1)

        # Example derivative
        example_deriv = MathTex("f'(x) = 3x^2").scale(0.8)
        self.play(TransformMatchingShapes(example_func, example_deriv))  # Smooth transition
        self.wait(2)
        self.play(FadeOut(example_deriv))


        # Final note (brief and centered)
        final_note = Text("Easy, right?").scale(0.6)
        self.play(Write(final_note))
        self.wait(2)
        self.play(FadeOut(final_note))