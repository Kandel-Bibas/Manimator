from manim import *

class PowerRule(Scene):
    def construct(self):
        # Title
        title = Text("Power Rule").scale(0.8)
        self.play(Write(title))
        self.wait(1)
        self.play(FadeOut(title))

        # Formula
        formula = MathTex("f(x) = x^n").scale(0.8)
        self.play(Write(formula))
        self.wait(1)

        # Derivative
        deriv = MathTex("f'(x) = nx^{n-1}").scale(0.8)
        self.play(Transform(formula, deriv))
        self.wait(1)
        self.play(FadeOut(formula))  # Now deriv

        # Example title
        example_title = Text("Example").scale(0.7)
        self.play(Write(example_title))
        self.wait(1)
        self.play(FadeOut(example_title))

        # Example function
        example_func = MathTex("f(x) = x^3").scale(0.8)
        self.play(Write(example_func))
        self.wait(1)

        # Example derivative
        example_deriv = MathTex("f'(x) = 3x^2").scale(0.8)
        self.play(Transform(example_func, example_deriv)) # Now example_deriv
        self.wait(1)
        self.play(FadeOut(example_deriv))


        #Group and arrange elements
        #vg = VGroup(title, formula, deriv, example_title, example_func, example_deriv).arrange(DOWN)
        #self.add(vg)