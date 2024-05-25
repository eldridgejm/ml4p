"""Provides a directive for exercise questions."""
import uuid

from docutils.parsers.rst import Directive
from docutils import nodes

class ExerciseNode(nodes.General, nodes.Element):
    pass

class QuestionNode(nodes.General, nodes.Element):

    def __init__(self, id, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.id = id

class AnswerNode(nodes.General, nodes.Element):

    def __init__(self, id, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.id = id

class ExerciseDirective(Directive):
    required_arguments = 0
    optional_arguments = 0
    final_argument_whitespace = True
    has_content = True

    def run(self):
        split_index = self.content.index('---')
        question_lines = self.content[:split_index]
        answer_lines = self.content[split_index + 1:]

        id = str(uuid.uuid4())

        # create QuestionNode
        question_node = QuestionNode(id)
        self.state.nested_parse(question_lines, self.content_offset, question_node)

        # create AnswerNode
        answer_node = AnswerNode(id)
        self.state.nested_parse(answer_lines, self.content_offset, answer_node)

        exercise = ExerciseNode('')
        exercise += question_node
        exercise += answer_node

        return [exercise]


def html_visit_exercise_node(self, node):
    self.body.append(self.starttag(node, 'div', CLASS='exercise'))
    self.body.append('<div class="exercise-title">\n')
    self.body.append('Exercise\n')
    self.body.append('</div>\n')
    self.body.append('<div class="exercise-content">\n')

def html_visit_question_node(self, node):
    self.body.append(self.starttag(node, 'div', CLASS='exercise-question'))

def html_visit_answer_node(self, node):
    self.body.append(f"<div class='exercise-answer collapse' id='{node.id}'>\n")


def html_depart_exercise_node(self, node):
    self.body.append('</div>\n')
    self.body.append('</div>\n')

def html_depart_question_node(self, node):
    # add a "show answer" button
    self.body.append('<div class="exercise-show-answer-button-container">\n')
    self.body.append(f'<button data-bs-toggle="collapse" data-bs-target="#{node.id}" class="btn border exercise-show-answer-button">Show Answer</button>\n')
    self.body.append('</div>\n')
    self.body.append('</div>\n')

def html_depart_answer_node(self, node):
    self.body.append('</div>\n')


def setup(app):
    app.add_directive("exercise", ExerciseDirective)
    app.add_node(ExerciseNode, html=(html_visit_exercise_node, html_depart_exercise_node))
    app.add_node(QuestionNode, html=(html_visit_question_node, html_depart_question_node))
    app.add_node(AnswerNode, html=(html_visit_answer_node, html_depart_answer_node))
